import { Authorized, Connection, Keypair, LAMPORTS_PER_SOL, Lockup, PublicKey, StakeProgram } from "@solana/web3.js";

export const createStakeAccount = async (connection: Connection, owner: PublicKey) => {
  const stakeAccount = Keypair.generate();

  console.log(stakeAccount.publicKey.toBase58());

  const amountUserWantsToStake = LAMPORTS_PER_SOL * 0.01;
  // Calculate how much we want to stake
  const minimumRent = await connection.getMinimumBalanceForRentExemption(StakeProgram.space);
  const amountToStake = minimumRent + amountUserWantsToStake;

  const createStakeAccountTx = StakeProgram.createAccount({
    authorized: new Authorized(owner, owner), // Here we set two authorities: Stake Authority and Withdrawal Authority. Both are set to our wallet.
    fromPubkey: owner,
    lamports: amountToStake,
    lockup: new Lockup(0, 0, owner), // Optional. We'll set this to 0 for demonstration purposes.
    stakePubkey: stakeAccount.publicKey,
  });

  return createStakeAccountTx;

  // const createStakeAccountTxId = await sendAndConfirmTransaction(connection, createStakeAccountTx, [
  //   payer,
  //   stakeAccount, // Since we're creating a new stake account, we have that account sign as well
  // ]);
};

export const getStakeBalance = async (connection: Connection, stakeAccountPubkey: PublicKey) => {
  return connection.getBalance(stakeAccountPubkey);
};

export const getStakeStatus = async (connection: Connection, stakeAccountPubkey: PublicKey) => {
  return connection.getStakeActivation(stakeAccountPubkey);
};

export const delegateStake = (stakeAccount: PublicKey, owner: PublicKey, selectedValidatorPubkey: PublicKey) => {
  const delegateTx = StakeProgram.delegate({
    stakePubkey: stakeAccount,
    authorizedPubkey: owner,
    votePubkey: selectedValidatorPubkey,
  });

  return delegateTx;
};

export const deactivateStake = (stakeAccount: PublicKey, owner: PublicKey) => {
  const deactivateTx = StakeProgram.deactivate({
    stakePubkey: stakeAccount,
    authorizedPubkey: owner,
  });

  return deactivateTx;
};

export const withdrawStake = async (connection: Connection, stakeAccount: PublicKey, owner: PublicKey) => {
  const stakeBalance = await connection.getBalance(stakeAccount);

  const withdrawTx = StakeProgram.withdraw({
    stakePubkey: stakeAccount,
    authorizedPubkey: owner,
    toPubkey: owner,
    lamports: stakeBalance, // Withdraw the full balance at the time of the transaction
  });

  return withdrawTx;
};

export const getValidators = (connection: Connection) => {
  return connection.getVoteAccounts();
};
