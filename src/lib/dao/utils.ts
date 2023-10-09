// REF https://github.com/nation-io/solana-dao-sdk/blob/main/packages/solana-dao-sdk/src/internal/services/daoService.ts

import { BlockhashWithExpiryBlockHeight, Connection, PublicKey, Transaction } from "@solana/web3.js";
import { createMint, getOrCreateAssociatedTokenAccount, mintTo } from "../token";
import { Wallet } from "@project-serum/anchor/dist/cjs/provider";
import { BN } from "@project-serum/anchor";
import {
  GovernanceConfig,
  SetRealmAuthorityAction,
  VoteThreshold,
  VoteThresholdType,
  VoteTipping,
  getTokenOwnerRecordAddress,
  withCreateMintGovernance,
  withCreateRealm,
  withDepositGoverningTokens,
  withSetRealmAuthority,
} from "@solana/spl-governance";
import { DEFAULT_COMMUNITY_MINT_MAX_VOTE_WEIGHT_SOURCE, GOVERNANCE_PROGRAM_ID, MIN_COMMUNITY_TOKENS_TO_CREATE_WITH_ZERO_SUPPLY } from "./constants";
import BigNumber from "bignumber.js";

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

export const createConfiguredDao = async (
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
