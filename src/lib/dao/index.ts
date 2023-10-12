import { Connection, Keypair, PublicKey, Transaction, TransactionInstruction, sendAndConfirmRawTransaction } from "@solana/web3.js";
import {
  GoverningTokenConfigAccountArgs,
  GoverningTokenType,
  ProgramAccount,
  Proposal,
  Realm,
  TokenOwnerRecord,
  getAllProposals,
  getAllTokenOwnerRecords,
  getRealm,
  getRealms,
  getTokenOwnerRecordsByOwner,
} from "@solana/spl-governance";
import { Wallet } from "@project-serum/anchor/dist/cjs/provider";
import { createCommunityDao, createMultisigdDao, daoMints, mintCouncilTokensToMembers } from "./utils";
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
}
