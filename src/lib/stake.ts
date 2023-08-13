import { Authorized, Connection, GetProgramAccountsFilter, Keypair, LAMPORTS_PER_SOL, Lockup, PublicKey, StakeProgram, VoteAccountInfo } from "@solana/web3.js";

export const createStakeAccount = async (connection: Connection, owner: PublicKey, balance: number, time: number = 0, epoch: number = 0) => {
  const stakeAccount = Keypair.generate();

  const amountUserWantsToStake = LAMPORTS_PER_SOL * balance;
  // Calculate how much we want to stake
  const minimumRent = await connection.getMinimumBalanceForRentExemption(StakeProgram.space);
  const amountToStake = minimumRent + amountUserWantsToStake;

  const createStakeAccountTx = StakeProgram.createAccount({
    authorized: new Authorized(owner, owner), // Here we set two authorities: Stake Authority and Withdrawal Authority. Both are set to our wallet.
    fromPubkey: owner,
    lamports: amountToStake,
    lockup: new Lockup(time, epoch, owner), // Optional. We'll set this to 0 for demonstration purposes.
    stakePubkey: stakeAccount.publicKey,
  });

  return { stakeAccount, createStakeAccountTx };

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

export const delegateStake = (stakeAccount: PublicKey, owner: PublicKey, voteAccount: VoteAccountInfo) => {
  const selectedValidatorPubkey = new PublicKey(voteAccount.votePubkey);

  const delegateTx = StakeProgram.delegate({
    stakePubkey: stakeAccount,
    authorizedPubkey: owner,
    votePubkey: selectedValidatorPubkey,
  });

  return delegateTx;
};

export const deactivateStake = (stakeAccountPubkey: PublicKey, owner: PublicKey) => {
  const deactivateTx = StakeProgram.deactivate({
    stakePubkey: stakeAccountPubkey,
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

export const getValidators = async (connection: Connection) => {
  const validators = await connection.getVoteAccounts();

  return validators.current;
};

export const fetchAllStakes = async (connection: Connection, owner: PublicKey) => {
  const filters: GetProgramAccountsFilter[] = [
    {
      memcmp: {
        offset: 12, //location of our query in the account (bytes)
        bytes: owner.toBase58(), //our search criteria, a base58 encoded string
      },
    },
  ];

  const accounts = await connection.getParsedProgramAccounts(StakeProgram.programId, { filters: filters });

  return accounts;
};
