/* eslint-disable @typescript-eslint/no-unused-vars */
// REF https://github.com/nation-io/solana-dao-sdk/blob/main/packages/solana-dao-sdk/src/internal/services/daoService.ts
// ref https://github.com/solana-labs/governance-ui

import { BlockhashWithExpiryBlockHeight, Connection, Keypair, PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js";
import { createMint, getOrCreateAssociatedTokenAccount, mintTo } from "../token";
import { Wallet } from "@project-serum/anchor/dist/cjs/provider";
import { BN } from "@project-serum/anchor";
import {
  Governance,
  GovernanceConfig,
  GoverningTokenConfigAccountArgs,
  InstructionData,
  MintMaxVoteWeightSource,
  MintMaxVoteWeightSourceType,
  ProgramAccount,
  SetRealmAuthorityAction,
  VoteThreshold,
  VoteThresholdType,
  VoteTipping,
  getGovernanceProgramVersion,
  getInstructionDataFromBase64,
  getTokenOwnerRecordAddress,
  withCreateGovernance,
  withCreateMintGovernance,
  withCreateNativeTreasury,
  withCreateRealm,
  withCreateTokenOwnerRecord,
  withDepositGoverningTokens,
  withSetRealmAuthority,
} from "@solana/spl-governance";
import { DEFAULT_COMMUNITY_MINT_MAX_VOTE_WEIGHT_SOURCE, DISABLED_VOTER_WEIGHT, GOVERNANCE_PROGRAM_ID, MIN_COMMUNITY_TOKENS_TO_CREATE_WITH_ZERO_SUPPLY } from "./constants";
import BigNumber from "bignumber.js";
import { tryGetMint, withCreateAssociatedTokenAccount, withCreateMint, withMintTo } from "./token";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment

import { AuthorityType, createSetAuthorityInstruction } from "@solana/spl-token";

export const mintCommunityToken = async (connection: Connection, wallet: Wallet, recentBlockhash: BlockhashWithExpiryBlockHeight, decimal = 8) => {
  const communityMint = await createMint(connection, wallet.publicKey, wallet.publicKey, decimal);

  const transaction = new Transaction({
    blockhash: recentBlockhash.blockhash,
    lastValidBlockHeight: recentBlockhash.lastValidBlockHeight,
    feePayer: wallet.publicKey,
  });
  transaction.add(communityMint.transaction);
  transaction.partialSign(communityMint.toAccount);

  return {
    transaction,
    communityMintPk: communityMint.toAccount.publicKey,
  };
};

export const mintCouncilToken = async (connection: Connection, wallet: Wallet, recentBlockhash: BlockhashWithExpiryBlockHeight, decimal = 0) => {
  const communityMint = await createMint(connection, wallet.publicKey, wallet.publicKey, decimal);

  const transaction = new Transaction({
    blockhash: recentBlockhash.blockhash,
    lastValidBlockHeight: recentBlockhash.lastValidBlockHeight,
    feePayer: wallet.publicKey,
  });

  transaction.add(communityMint.transaction);
  transaction.partialSign(communityMint.toAccount);

  return {
    transaction,
    communityMintPk: communityMint.toAccount.publicKey,
  };
};

export const daoMints = async (connection: Connection, wallet: Wallet, recentBlockhash: BlockhashWithExpiryBlockHeight, decimal = 8) => {
  const communityMint = await createMint(connection, wallet.publicKey, wallet.publicKey, decimal);

  const councilMint = await createMint(connection, wallet.publicKey, wallet.publicKey, 0);

  const transaction = new Transaction({
    blockhash: recentBlockhash.blockhash,
    lastValidBlockHeight: recentBlockhash.lastValidBlockHeight,
    feePayer: wallet.publicKey,
  });

  transaction.add(communityMint.transaction);
  transaction.add(councilMint.transaction);

  transaction.partialSign(communityMint.toAccount);
  transaction.partialSign(councilMint.toAccount);

  return {
    transaction,
    communityMintPk: communityMint.toAccount.publicKey,
    councilMintPk: councilMint.toAccount.publicKey,
  };
};

export const mintCouncilTokensToMembers = async (
  councilWalletsPks: PublicKey[],
  councilMintPk: PublicKey,
  wallet: Wallet,
  connection: Connection,
  recentBlockhash: BlockhashWithExpiryBlockHeight,
  amount = 1,
  decimal = 8
) => {
  const instructions = [];
  let walletAssociatedTokenAccountPk;

  // const isWalletInCouncilWallets = councilWalletsPks.some((teamWalletPk) => teamWalletPk.equals(wallet.publicKey));

  for (const teamWalletPk of councilWalletsPks) {
    const associatedTokenAccount = await getOrCreateAssociatedTokenAccount(councilMintPk, wallet.publicKey, teamWalletPk, connection);

    const mint = mintTo(councilMintPk, associatedTokenAccount.associatedToken, wallet.publicKey, amount, decimal);

    instructions.push(associatedTokenAccount.transaction, mint);

    if (teamWalletPk.equals(wallet.publicKey)) {
      walletAssociatedTokenAccountPk = associatedTokenAccount.associatedToken;
    }
  }

  const transaction = new Transaction({
    blockhash: recentBlockhash.blockhash,
    lastValidBlockHeight: recentBlockhash.lastValidBlockHeight,
    feePayer: wallet.publicKey,
  });

  instructions.forEach((instruction) => transaction.add(instruction!));

  return {
    transaction,
    walletAssociatedTokenAccountPk,
  };
};

export const createMultisigdDao = async (
  name: string,
  yesVoteThreshold: number,
  walletPk: PublicKey,
  communityMintPk: PublicKey,
  councilMintPk: PublicKey,
  walletAssociatedTokenAccountPk: PublicKey,
  recentBlockhash: BlockhashWithExpiryBlockHeight
) => {
  const { daoPk, instructions } = await createDao(name, yesVoteThreshold, walletPk, communityMintPk, councilMintPk, walletAssociatedTokenAccountPk);

  const transaction = new Transaction({
    blockhash: recentBlockhash.blockhash,
    lastValidBlockHeight: recentBlockhash.lastValidBlockHeight,
    feePayer: walletPk,
  });

  instructions.forEach((instruction) => transaction.add(instruction));

  return { daoPk, transaction };
};

const createDao = async (
  name: string,
  yesVoteThreshold: number,
  walletPk: PublicKey,
  communityMintPk: PublicKey,
  councilMintPk: PublicKey,
  walletAssociatedTokenAccountPk: PublicKey,
  decimal = 8,
  tokenAmount = 1
) => {
  const communityTokenConfig = undefined;
  const councilTokenConfig = undefined;
  const voterWeightRecord = undefined;
  const instructions: never[] = [];

  const minCommunityTokensToCreateAsMintValue = new BN(getMintNaturalAmountFromDecimal(MIN_COMMUNITY_TOKENS_TO_CREATE_WITH_ZERO_SUPPLY, decimal));

  const realmPk = await withCreateRealm(
    instructions,
    GOVERNANCE_PROGRAM_ID,
    3,
    name,
    walletPk,
    communityMintPk,
    walletPk,
    councilMintPk,
    DEFAULT_COMMUNITY_MINT_MAX_VOTE_WEIGHT_SOURCE,
    minCommunityTokensToCreateAsMintValue,
    communityTokenConfig,
    councilTokenConfig
  );

  await withDepositGoverningTokens(
    instructions,
    GOVERNANCE_PROGRAM_ID,
    3,
    realmPk,
    walletAssociatedTokenAccountPk,
    councilMintPk,
    walletPk,
    walletPk,
    walletPk,
    new BN(tokenAmount)
  );

  const tokenOwnerRecordPk = await getTokenOwnerRecordAddress(GOVERNANCE_PROGRAM_ID, realmPk, councilMintPk, walletPk);

  // Put community and council mints under the realm governance with default config
  const config = new GovernanceConfig({
    communityVoteThreshold: new VoteThreshold({
      type: VoteThresholdType.YesVotePercentage,
      value: yesVoteThreshold,
    }),
    minCommunityTokensToCreateProposal: minCommunityTokensToCreateAsMintValue,
    // Do not use instruction hold up time
    minInstructionHoldUpTime: 0,
    // max voting time 3 days
    baseVotingTime: getTimestampFromDays(3),
    communityVoteTipping: VoteTipping.Strict,
    minCouncilTokensToCreateProposal: new BN(1),
    councilVoteThreshold: new VoteThreshold({
      type: VoteThresholdType.YesVotePercentage,
      value: 1,
    }),
    councilVetoVoteThreshold: new VoteThreshold({
      type: VoteThresholdType.YesVotePercentage,
      value: yesVoteThreshold,
    }),
    communityVetoVoteThreshold: new VoteThreshold({
      type: VoteThresholdType.YesVotePercentage,
      value: yesVoteThreshold,
    }),
    councilVoteTipping: VoteTipping.Strict,
    votingCoolOffTime: 0,
    depositExemptProposalCount: 0,
  });

  const communityMintGovPk = await withCreateMintGovernance(
    instructions,
    GOVERNANCE_PROGRAM_ID,
    3,
    realmPk,
    communityMintPk,
    config,
    !!walletPk,
    walletPk,
    tokenOwnerRecordPk,
    walletPk,
    walletPk,
    voterWeightRecord
  );

  // Set the community governance as the realm authority
  withSetRealmAuthority(instructions, GOVERNANCE_PROGRAM_ID, 3, realmPk, walletPk, communityMintGovPk, SetRealmAuthorityAction.SetChecked);

  return { daoPk: realmPk, instructions };
};

const getMintNaturalAmountFromDecimal = (decimalAmount: number, decimals: number) => {
  return new BigNumber(decimalAmount).shiftedBy(decimals).toNumber();
};

const getTimestampFromDays = (days: number) => {
  const SECONDS_PER_DAY = 86400;

  return days * SECONDS_PER_DAY;
};

export const createCommunityDao = async (
  connection: Connection,
  walletPk: PublicKey,
  realmName: string,
  useSupplyFactor: boolean,
  createCouncil: boolean,
  councilWalletPks: PublicKey[],
  communityYesVotePercentage: "disabled" | number,
  councilYesVotePercentage: "disabled" | number,
  transferCommunityMintAuthority: boolean,
  transferCouncilMintAuthority: boolean,
  existingCommunityMintPk?: PublicKey,
  existingCouncilMintPk?: PublicKey,
  communityTokenConfig?: GoverningTokenConfigAccountArgs,
  councilTokenConfig?: GoverningTokenConfigAccountArgs,
  communityMintSupplyFactor?: number,
  communityAbsoluteMaxVoteWeight?: number,
  tokensToGovernThreshold?: number,
  maxVotingTimeInDays?: number,
  skipRealmAuthority?: boolean
) => {
  const realmInstructions: TransactionInstruction[] = [];
  const realmSigners: Keypair[] = [];

  const mintsSetupInstructions: TransactionInstruction[] = [];
  const councilMembersInstructions: TransactionInstruction[] = [];

  const mintsSetupSigners: Keypair[] = [];
  const initialCouncilTokenAmount = 1;

  const programIdPk = GOVERNANCE_PROGRAM_ID;

  const programVersion = await getGovernanceProgramVersion(connection, programIdPk);

  const communityMintAccount = existingCommunityMintPk && (await tryGetMint(connection, existingCommunityMintPk));
  // const zeroCommunityTokenSupply = existingCommunityMintPk ? communityMintAccount?.account.supply.isZero() : true;
  const communityMintDecimals = communityMintAccount?.account?.decimals || 6;

  const communityMaxVoteWeightSource = parseMintMaxVoteWeight(useSupplyFactor, communityMintDecimals, communityMintSupplyFactor, communityAbsoluteMaxVoteWeight);

  const councilMintAccount = existingCouncilMintPk && (await tryGetMint(connection, existingCouncilMintPk));
  // const zeroCouncilTokenSupply = existingCouncilMintPk ? councilMintAccount?.account.supply.isZero() : true;
  const councilMintHasMintAuthority = councilMintAccount ? !!councilMintAccount.account.mintAuthority : true;

  let communityMintPk = existingCommunityMintPk;

  if (!communityMintPk) {
    // Create community mint
    communityMintPk = await withCreateMint(connection, mintsSetupInstructions, mintsSetupSigners, walletPk, null, communityMintDecimals, walletPk);
  }

  let councilMintPk;

  // if (zeroCommunityTokenSupply && zeroCouncilTokenSupply) {
  //   throw new Error("no tokens exist that could govern this DAO");
  // }

  if (!existingCouncilMintPk && createCouncil) {
    councilMintPk = await withCreateMint(connection, mintsSetupInstructions, mintsSetupSigners, walletPk, null, 0, walletPk);
  } else {
    councilMintPk = existingCouncilMintPk;
  }

  // Convert to mint natural amount
  const minCommunityTokensToCreateAsMintValue =
    typeof tokensToGovernThreshold !== "undefined" ? new BN(getMintNaturalAmountFromDecimal(tokensToGovernThreshold, communityMintDecimals)) : DISABLED_VOTER_WEIGHT;

  const realmPk = await withCreateRealm(
    realmInstructions,
    programIdPk,
    programVersion,
    realmName,
    walletPk,
    communityMintPk,
    walletPk,
    councilMintPk,
    communityMaxVoteWeightSource,
    minCommunityTokensToCreateAsMintValue,
    communityTokenConfig,
    councilTokenConfig
  );

  for (const teamWalletPk of councilWalletPks) {
    // In version 3 we just deposit council tokens directly into the DAO
    if (programVersion >= 3) {
      // This is a workaround for an unnecessary signer check in DepositGoverningTokens.
      if (teamWalletPk !== walletPk) {
        await withCreateTokenOwnerRecord(realmInstructions, programIdPk, programVersion, realmPk, teamWalletPk, councilMintPk!, walletPk);
      }

      await withDepositGoverningTokens(
        realmInstructions,
        programIdPk,
        programVersion,
        realmPk,
        councilMintPk!,
        councilMintPk!,
        teamWalletPk,
        walletPk,
        walletPk,
        new BN(initialCouncilTokenAmount)
      );
      // TODO remove workaround once unnecessary signer bug in sdk is fixed
      // this is a workaround
      const buggedIx = realmInstructions[realmInstructions.length - 1];
      // make teamWalletPk not a signer
      buggedIx.keys = buggedIx.keys.map((key) => (key.pubkey.equals(teamWalletPk) && !key.pubkey.equals(walletPk) ? { ...key, isSigner: false } : key));
    }

    // before version 3, we have to mint the tokens to wallets
    else {
      const ataPk = await withCreateAssociatedTokenAccount(councilMembersInstructions, councilMintPk!, teamWalletPk, walletPk);

      // Mint 1 council token to each team member
      await withMintTo(councilMembersInstructions, councilMintPk!, ataPk, walletPk, initialCouncilTokenAmount);

      if (teamWalletPk.equals(walletPk)) {
        await withDepositGoverningTokens(
          realmInstructions,
          programIdPk,
          programVersion,
          realmPk,
          ataPk,
          councilMintPk!,
          walletPk,
          walletPk,
          walletPk,
          new BN(initialCouncilTokenAmount)
        );
      }
    }
  }

  const { communityVoteThreshold, councilVoteThreshold, councilVetoVoteThreshold, communityVetoVoteThreshold } = createGovernanceThresholds(
    programVersion,
    communityYesVotePercentage,
    councilYesVotePercentage
  );

  const VOTING_COOLOFF_TIME_DEFAULT = getTimestampFromDays(1);
  // Put community and council mints under the realm governance with default config
  const config = new GovernanceConfig({
    communityVoteThreshold: communityVoteThreshold,
    minCommunityTokensToCreateProposal: minCommunityTokensToCreateAsMintValue,
    // Do not use instruction hold up time
    minInstructionHoldUpTime: 0,
    // maxVotingTime = baseVotingTime + votingCoolOffTime
    // since this is actually baseVotingTime, we have to manually subtract the cooloff time.
    baseVotingTime: getTimestampFromDays(maxVotingTimeInDays || 3) - VOTING_COOLOFF_TIME_DEFAULT,
    communityVoteTipping: VoteTipping.Disabled,
    councilVoteTipping: VoteTipping.Strict,
    minCouncilTokensToCreateProposal: new BN(initialCouncilTokenAmount),
    councilVoteThreshold: councilVoteThreshold,
    councilVetoVoteThreshold: councilVetoVoteThreshold,
    communityVetoVoteThreshold: communityVetoVoteThreshold,
    votingCoolOffTime: VOTING_COOLOFF_TIME_DEFAULT,
    depositExemptProposalCount: 10,
  });

  const mainGovernancePk = await withCreateGovernance(realmInstructions, programIdPk, programVersion, realmPk, undefined, config, PublicKey.default, walletPk, walletPk);

  const nativeTreasuryAddress = await withCreateNativeTreasury(realmInstructions, programIdPk, programVersion, mainGovernancePk, walletPk);

  if (transferCommunityMintAuthority) {
    const ix = createSetAuthorityInstruction(communityMintPk, walletPk, AuthorityType.MintTokens, nativeTreasuryAddress, []);
    if (communityMintAccount?.account.freezeAuthority) {
      const freezeMintAuthorityPassIx = createSetAuthorityInstruction(communityMintPk, walletPk, AuthorityType.FreezeAccount, nativeTreasuryAddress, []);
      realmInstructions.push(freezeMintAuthorityPassIx);
    }
    realmInstructions.push(ix);
  }

  if (councilMintPk && councilMintHasMintAuthority && transferCouncilMintAuthority) {
    const ix = createSetAuthorityInstruction(councilMintPk, walletPk, AuthorityType.MintTokens, nativeTreasuryAddress, []);
    if (councilMintAccount?.account.freezeAuthority) {
      const freezeMintAuthorityPassIx = createSetAuthorityInstruction(councilMintPk, walletPk, AuthorityType.FreezeAccount, nativeTreasuryAddress, []);
      realmInstructions.push(freezeMintAuthorityPassIx);
    }
    realmInstructions.push(ix);
  }

  // Set the community governance as the realm authority
  if (!skipRealmAuthority) {
    withSetRealmAuthority(realmInstructions, programIdPk, programVersion, realmPk, walletPk, mainGovernancePk, SetRealmAuthorityAction.SetChecked);
  }

  return {
    mainGovernancePk,
    communityMintPk,
    councilMintPk,
    realmPk,
    realmInstructions,
    realmSigners,
    mintsSetupInstructions,
    mintsSetupSigners,
    councilMembersInstructions,
    walletPk,
    programIdPk,
    programVersion,
    minCommunityTokensToCreateAsMintValue,
  };
};

const parseMintMaxVoteWeight = (useSupplyFactor: boolean, communityMintDecimals: number, supplyFactor?: number, absoluteValue?: number) => {
  if (useSupplyFactor) {
    return supplyFactor
      ? new MintMaxVoteWeightSource({
          type: MintMaxVoteWeightSourceType.SupplyFraction,
          value: new BN(new BigNumber(supplyFactor.toString()).shiftedBy(MintMaxVoteWeightSource.SUPPLY_FRACTION_DECIMALS).toString()),
        })
      : MintMaxVoteWeightSource.FULL_SUPPLY_FRACTION;
  } else
    return new MintMaxVoteWeightSource({
      type: MintMaxVoteWeightSourceType.Absolute,
      value: absoluteValue ? new BN(getMintNaturalAmountFromDecimal(absoluteValue, communityMintDecimals)) : new BN(1000),
    });
};

function createGovernanceThresholds(
  programVersion: number,
  communityYesVotePercentage: "disabled" | number,
  // ignored if program version < v3
  councilYesVotePercentage?: "disabled" | number
) {
  // For backward compatybility with spl-gov versions <= 2
  // for Council vote and Veto vote thresholds we have to pass YesVotePerentage(0)
  const undefinedThreshold = new VoteThreshold({
    type: VoteThresholdType.YesVotePercentage,
    value: 0,
  });

  const communityVoteThreshold =
    programVersion >= 3
      ? communityYesVotePercentage !== "disabled"
        ? new VoteThreshold({
            value: communityYesVotePercentage,
            type: VoteThresholdType.YesVotePercentage,
          })
        : new VoteThreshold({ type: VoteThresholdType.Disabled })
      : new VoteThreshold({
          value: communityYesVotePercentage as number,
          type: VoteThresholdType.YesVotePercentage,
        });

  const councilVoteThreshold =
    programVersion >= 3
      ? councilYesVotePercentage !== "disabled" && councilYesVotePercentage !== undefined
        ? new VoteThreshold({
            value: councilYesVotePercentage,
            type: VoteThresholdType.YesVotePercentage,
          })
        : new VoteThreshold({ type: VoteThresholdType.Disabled })
      : undefinedThreshold;

  const councilVetoVoteThreshold = programVersion >= 3 ? councilVoteThreshold : undefinedThreshold;

  const communityVetoVoteThreshold = programVersion >= 3 ? new VoteThreshold({ type: VoteThresholdType.Disabled }) : undefinedThreshold;

  return {
    communityVoteThreshold,
    councilVoteThreshold,
    councilVetoVoteThreshold,
    communityVetoVoteThreshold,
  };
}

export interface UiInstruction {
  serializedInstruction: string;
  additionalSerializedInstructions?: string[];
  isValid: boolean;
  governance: ProgramAccount<Governance> | undefined;
  customHoldUpTime?: number;
  prerequisiteInstructions?: TransactionInstruction[];
  prerequisiteInstructionsSigners?: (Keypair | null)[];
  chunkBy?: number;
  signers?: Keypair[];
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export interface InstructionDataWithHoldUpTime {
  data: InstructionData | null;
  holdUpTime: number | undefined;
  prerequisiteInstructions: TransactionInstruction[];
  chunkBy?: number;
  signers?: Keypair[];
  prerequisiteInstructionsSigners?: (Keypair | null)[];
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class InstructionDataWithHoldUpTime {
  constructor({ instruction, governance }: { instruction: UiInstruction; governance?: ProgramAccount<Governance> }) {
    this.data = instruction.serializedInstruction ? getInstructionDataFromBase64(instruction.serializedInstruction) : null;
    this.holdUpTime = typeof instruction.customHoldUpTime !== "undefined" ? instruction.customHoldUpTime : governance?.account?.config.minInstructionHoldUpTime;
    this.prerequisiteInstructions = instruction.prerequisiteInstructions || [];
    this.chunkBy = instruction.chunkBy || 2;
    this.prerequisiteInstructionsSigners = instruction.prerequisiteInstructionsSigners || [];
  }
}

export function chunks<T>(array: T[], size: number): T[][] {
  const result: Array<T[]> = [];
  let i, j;
  for (i = 0, j = array.length; i < j; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

export const deduplicateObjsFilter = (value: any, index: any, self: any[]) => index === self.findIndex((t) => JSON.stringify(t) === JSON.stringify(value));

export const txBatchesToInstructionSetWithSigners = (txBatch: TransactionInstruction[], signerBatches: Keypair[][], batchIdx?: number) => {
  return txBatch.map((tx, txIdx) => {
    return {
      transactionInstruction: tx,
      signers: typeof batchIdx !== "undefined" && signerBatches.length && signerBatches[batchIdx] && signerBatches[batchIdx][txIdx] ? [signerBatches[batchIdx][txIdx]] : [],
    };
  });
};
