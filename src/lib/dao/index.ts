import { Connection, Keypair, PublicKey, Transaction, TransactionInstruction, sendAndConfirmRawTransaction } from "@solana/web3.js";
import {
  GoverningTokenConfigAccountArgs,
  GoverningTokenType,
  MultiChoiceType,
  ProgramAccount,
  Proposal,
  Realm,
  TokenOwnerRecord,
  Vote,
  VoteChoice,
  VoteKind,
  VoteType,
  getAllProposals,
  getAllTokenOwnerRecords,
  getRealm,
  getRealms,
  getSignatoryRecordAddress,
  getTokenOwnerRecordsByOwner,
  withAddSignatory,
  withCastVote,
  withCreateProposal,
  withInsertTransaction,
  withSignOffProposal,
} from "@solana/spl-governance";
import { Wallet } from "@project-serum/anchor/dist/cjs/provider";
import {
  InstructionDataWithHoldUpTime,
  chunks,
  createCommunityDao,
  createMultisigdDao,
  daoMints,
  deduplicateObjsFilter,
  getVetoTokenMint,
  mintCouncilTokensToMembers,
  txBatchesToInstructionSetWithSigners,
} from "./utils";
import { GOVERNANCE_PROGRAM_ID } from "./constants";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";

export class DAO {
  private connection: Connection;
  private wallet: Wallet;

  constructor(connection: Connection, wallet: Wallet) {
    this.connection = connection;
    this.wallet = wallet;
  }

  private getAllDaos = async (): Promise<ProgramAccount<Realm>[]> => {
    return getRealms(this.connection, [GOVERNANCE_PROGRAM_ID]);
  };

  private getMyDaos = async (): Promise<{
    myDaos: ProgramAccount<Realm>[];
    allDaos: ProgramAccount<Realm>[];
  }> => {
    const allDaos = await this.getAllDaos();

    const myOwnDaos = await getTokenOwnerRecordsByOwner(this.connection, GOVERNANCE_PROGRAM_ID, this.wallet.publicKey);

    const myDaoPubkeys = myOwnDaos.map((md) => md.account.realm.toBase58());

    const myDaos: ProgramAccount<Realm>[] = [];

    allDaos.forEach((ads) => {
      if (myDaoPubkeys.includes(ads.pubkey.toBase58())) {
        myDaos.push(ads);
      }
    });

    return { myDaos, allDaos };
  };

  getDaoDetails = async (
    currentRealm: PublicKey
  ): Promise<{
    dao: ProgramAccount<Realm>;
  }> => {
    const dao = await getRealm(this.connection, currentRealm);

    return { dao };
  };

  fetchDaos = () => {
    return this.getMyDaos();
  };

  getMembers = async (dao: PublicKey): Promise<ProgramAccount<TokenOwnerRecord>[]> => {
    return getAllTokenOwnerRecords(this.connection, GOVERNANCE_PROGRAM_ID, dao);
  };

  getProposals = async (dao: PublicKey): Promise<ProgramAccount<Proposal>[]> => {
    const proposals = await getAllProposals(this.connection, GOVERNANCE_PROGRAM_ID, dao);
    console.log(proposals);
    return proposals[0];
  };

  createMultisigDao = async (multiSigWallets: PublicKey[], name: string, threshold: number) => {
    const recentBlockhash = await this.connection.getLatestBlockhash();
    const daoMintResult = await daoMints(this.connection, this.wallet, recentBlockhash);

    const mintResult = await mintCouncilTokensToMembers(multiSigWallets, daoMintResult.councilMintPk, this.wallet, this.connection, recentBlockhash);

    const { daoPk, transaction: daoTransaction } = await createMultisigdDao(
      name,
      threshold,
      this.wallet.publicKey,
      daoMintResult.communityMintPk,
      daoMintResult.councilMintPk,
      mintResult.walletAssociatedTokenAccountPk!,
      recentBlockhash
    );

    const transactions = [daoMintResult.transaction, mintResult.transaction, daoTransaction];

    const signedTx = await this.wallet.signAllTransactions(transactions);

    const transactionsSignatures: string[] = [];

    for (const signed of signedTx) {
      const rawTransaction = signed.serialize();
      const transactionSignature = await sendAndConfirmRawTransaction(
        this.connection,
        rawTransaction,
        {
          signature: bs58.encode(signed.signature!),
          blockhash: recentBlockhash.blockhash,
          lastValidBlockHeight: recentBlockhash.lastValidBlockHeight,
        },
        {
          commitment: "confirmed",
        }
      );

      transactionsSignatures.push(transactionSignature);
    }

    return { daoPk };
  };

  createCommunityDao = async (
    name: string,
    useSupplyFactor: boolean,
    createCouncil: boolean,
    councilWalletPks: PublicKey[],
    communityYesVotePercentage: number | "disabled",
    councilYesVotePercentage: number | "disabled",
    transferCommunityMintAuthority: boolean,
    transferCouncilMintAuthority: boolean,
    existingCommunityMintPk?: PublicKey | undefined,
    existingCouncilMintPk?: PublicKey | undefined
  ) => {
    const { realmPk, realmInstructions, realmSigners, mintsSetupInstructions, mintsSetupSigners, councilMembersInstructions } = await createCommunityDao(
      this.connection,
      this.wallet.publicKey,
      name,
      useSupplyFactor,
      createCouncil,
      councilWalletPks,
      communityYesVotePercentage,
      councilYesVotePercentage,
      transferCommunityMintAuthority,
      transferCouncilMintAuthority,
      existingCommunityMintPk,
      existingCouncilMintPk,
      undefined,
      createCouncil || existingCouncilMintPk
        ? new GoverningTokenConfigAccountArgs({
            tokenType: GoverningTokenType.Membership,
            voterWeightAddin: undefined,
            maxVoterWeightAddin: undefined,
          })
        : new GoverningTokenConfigAccountArgs({
            tokenType: GoverningTokenType.Dormant,
            voterWeightAddin: undefined,
            maxVoterWeightAddin: undefined,
          })
    );

    const instructions: TransactionInstruction[] = [...mintsSetupInstructions, ...realmInstructions, ...councilMembersInstructions];
    const transaction = new Transaction().add(...instructions);

    const signers: Keypair[] = [...realmSigners, ...mintsSetupSigners];

    return { transaction, signers, realmPk };
  };

  createProposal = async (dao: PublicKey, name: string, descriptionLink: string, isMulti = false, options = ["Approve"]) => {
    const daoDetail = (await this.getDaoDetails(dao)).dao;
    const governance = daoDetail.account.authority;
    const governanceAuthority = this.wallet.publicKey;

    const instructions: TransactionInstruction[] = [];
    const signers: Keypair[] = [];
    const proposalIndex = 0;
    const prerequisiteInstructions: TransactionInstruction[] = [];
    const prerequisiteInstructionsSigners: (Keypair | null)[] = [];

    const instructionsData: InstructionDataWithHoldUpTime[] = [
      new InstructionDataWithHoldUpTime({
        instruction: {
          customHoldUpTime: 0,

          prerequisiteInstructions: [],
          prerequisiteInstructionsSigners: [],
          signers: undefined,
          chunkBy: 2,
          serializedInstruction: "",
          isValid: false,
          governance: undefined,
        },
      }),
    ];

    const tokenOwnerRecord = await getAllTokenOwnerRecords(this.connection, daoDetail.owner, daoDetail.pubkey);

    const tokenOwnerRecordPk = tokenOwnerRecord[0].pubkey;

    const communityMint = tokenOwnerRecord[0].account.governingTokenMint;

    const voteType = isMulti ? VoteType.MULTI_CHOICE(MultiChoiceType.FullWeight, 1, options.length, options.length) : VoteType.SINGLE_CHOICE;

    const proposalAddress = await withCreateProposal(
      instructions,
      GOVERNANCE_PROGRAM_ID,
      3,
      dao,
      governance!,
      tokenOwnerRecordPk,
      name,
      descriptionLink,
      communityMint,
      governanceAuthority,
      proposalIndex,
      voteType,
      options,
      true,
      this.wallet.publicKey
    );

    const signatory = this.wallet.publicKey;

    await withAddSignatory(instructions, GOVERNANCE_PROGRAM_ID, 3, proposalAddress, tokenOwnerRecordPk, governanceAuthority, signatory, this.wallet.publicKey);

    const signatoryRecordAddress = await getSignatoryRecordAddress(GOVERNANCE_PROGRAM_ID, proposalAddress, signatory);

    const insertInstructions: TransactionInstruction[] = [];

    const chunkBys = instructionsData.filter((x) => x.chunkBy).map((x) => x.chunkBy!);

    const lowestChunkBy = chunkBys.length ? Math.min(...chunkBys) : 2;

    for (const [index, instruction] of instructionsData.filter((x) => x.data).entries()) {
      if (instruction.data) {
        if (instruction.prerequisiteInstructions) {
          prerequisiteInstructions.push(...instruction.prerequisiteInstructions);
        }
        if (instruction.prerequisiteInstructionsSigners) {
          prerequisiteInstructionsSigners.push(...instruction.prerequisiteInstructionsSigners);
        }
        await withInsertTransaction(
          insertInstructions,
          GOVERNANCE_PROGRAM_ID,
          3,
          governance!,
          proposalAddress,
          tokenOwnerRecordPk,
          governanceAuthority,
          index,
          0,
          instruction.holdUpTime || 0,
          [instruction.data],
          this.wallet.publicKey
        );
      }
    }

    const isDraft = false;

    if (!isDraft) {
      console.log("isdraft");
      withSignOffProposal(
        insertInstructions, // SingOff proposal needs to be executed after inserting instructions hence we add it to insertInstructions
        GOVERNANCE_PROGRAM_ID,
        3,
        dao,
        governance!,
        proposalAddress,
        signatory,
        signatoryRecordAddress,
        undefined
      );
    }

    const insertChunks = chunks(insertInstructions, lowestChunkBy);
    const signerChunks = Array(insertChunks.length);

    signerChunks.push(...chunks(signers, lowestChunkBy));
    signerChunks.fill([]);

    const deduplicatedPrerequisiteInstructions = prerequisiteInstructions.filter(deduplicateObjsFilter);

    const deduplicatedPrerequisiteInstructionsSigners = prerequisiteInstructionsSigners.filter(deduplicateObjsFilter);

    const prerequisiteInstructionsChunks = chunks(deduplicatedPrerequisiteInstructions, lowestChunkBy);

    const prerequisiteInstructionsSignersChunks = chunks(deduplicatedPrerequisiteInstructionsSigners, lowestChunkBy).filter((keypairArray) =>
      keypairArray.filter((keypair) => keypair)
    );

    const signersSet = [...prerequisiteInstructionsSignersChunks, [], ...signerChunks];

    const txes = [...prerequisiteInstructionsChunks, instructions, ...insertChunks].map((txBatch, batchIdx) => {
      return {
        instructionsSet: txBatchesToInstructionSetWithSigners(txBatch, signersSet, batchIdx),
        sequenceType: 0,
      };
    });

    return txes;
  };

  vote = async (daoPublickey: PublicKey, proposal: ProgramAccount<Proposal>, tokenOwnerRecord: PublicKey, voteKind: VoteKind, voteWeights?: number[]) => {
    const governanceAuthority = this.wallet.publicKey;
    const payer = this.wallet.publicKey;
    const programVersion = 3;

    const dao = (await this.getDaoDetails(daoPublickey)).dao;

    const isMulti = proposal.account.voteType !== VoteType.SINGLE_CHOICE;

    // It is not clear that defining these extraneous fields, `deny` and `veto`, is actually necessary.
    // See:  https://discord.com/channels/910194960941338677/910630743510777926/1044741454175674378
    const vote = isMulti
      ? new Vote({
          voteType: VoteKind.Approve,
          approveChoices: proposal.account.options.map((_o, index) => {
            if (voteWeights?.includes(index)) {
              return new VoteChoice({ rank: 0, weightPercentage: 100 });
            } else {
              return new VoteChoice({ rank: 0, weightPercentage: 0 });
            }
          }),
          deny: undefined,
          veto: undefined,
        })
      : voteKind === VoteKind.Approve
      ? new Vote({
          voteType: VoteKind.Approve,
          approveChoices: [new VoteChoice({ rank: 0, weightPercentage: 100 })],
          deny: undefined,
          veto: undefined,
        })
      : voteKind === VoteKind.Deny
      ? new Vote({
          voteType: VoteKind.Deny,
          approveChoices: undefined,
          deny: true,
          veto: undefined,
        })
      : voteKind == VoteKind.Veto
      ? new Vote({
          voteType: VoteKind.Veto,
          veto: true,
          deny: undefined,
          approveChoices: undefined,
        })
      : new Vote({
          voteType: VoteKind.Abstain,
          veto: undefined,
          deny: undefined,
          approveChoices: undefined,
        });

    const tokenMint = voteKind === VoteKind.Veto ? getVetoTokenMint(proposal, dao) : proposal.account.governingTokenMint;
    const castVoteIxs: TransactionInstruction[] = [];
    await withCastVote(
      castVoteIxs,
      GOVERNANCE_PROGRAM_ID,
      programVersion,
      daoPublickey,
      proposal.account.governance,
      proposal.pubkey,
      proposal.account.tokenOwnerRecord,
      tokenOwnerRecord,
      governanceAuthority,
      tokenMint,
      vote,
      payer
    );

    const transaction = new Transaction();
    transaction.add(...[...castVoteIxs]);

    return transaction;
  };
}
