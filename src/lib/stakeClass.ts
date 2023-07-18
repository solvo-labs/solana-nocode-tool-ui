import { Authorized, Connection, GetProgramAccountsFilter, Keypair, LAMPORTS_PER_SOL, Lockup, PublicKey, StakeProgram, VoteAccountInfo } from "@solana/web3.js";

class StakeClass {
  connection: Connection;
  owner: PublicKey;
  stakeAccountPubkey: PublicKey | undefined;
  stakeAccount: Keypair | undefined;

  constructor(connection: Connection, owner: PublicKey) {
    this.connection = connection;
    this.owner = owner;
  }

  getValidators = async () => {
    const validators = await this.connection.getVoteAccounts();

    return validators.current;
  };

  getStakeStatus = async (pubkey: PublicKey) => {
    this.stakeAccountPubkey = pubkey || this.stakeAccountPubkey || new PublicKey("");
    return this.connection.getStakeActivation(this.stakeAccountPubkey);
  };

  fetchAllStakes = async () => {
    const filters: GetProgramAccountsFilter[] = [
      {
        memcmp: {
          offset: 12, //location of our query in the account (bytes)
          bytes: this.owner.toBase58(), //our search criteria, a base58 encoded string
        },
      },
    ];

    const accounts = await this.connection.getParsedProgramAccounts(StakeProgram.programId, { filters: filters });
    const statusPromises = accounts.map((ac) => this.getStakeStatus(ac.pubkey));
    const statuses = await Promise.all(statusPromises);

    const finalData = accounts.map((ac, index) => {
      return { ...ac, state: statuses[index].state };
    });

    return finalData;
  };

  createStakeAccount = async (balance: number) => {
    const stakeAccount = Keypair.generate();
    this.stakeAccountPubkey = stakeAccount.publicKey;
    this.stakeAccount = stakeAccount;

    const amountUserWantsToStake = LAMPORTS_PER_SOL * balance;
    // Calculate how much we want to stake
    const minimumRent = await this.connection.getMinimumBalanceForRentExemption(StakeProgram.space);
    const amountToStake = minimumRent + amountUserWantsToStake;

    const createStakeAccountTx = StakeProgram.createAccount({
      authorized: new Authorized(this.owner, this.owner), // Here we set two authorities: Stake Authority and Withdrawal Authority. Both are set to our wallet.
      fromPubkey: this.owner,
      lamports: amountToStake,
      lockup: new Lockup(0, 0, this.owner), // Optional. We'll set this to 0 for demonstration purposes.
      stakePubkey: stakeAccount.publicKey,
    });

    return createStakeAccountTx;
  };

  getStakeBalance = async (pubkey?: PublicKey) => {
    this.stakeAccountPubkey = pubkey || this.stakeAccountPubkey || new PublicKey("");
    return this.connection.getBalance(this.stakeAccountPubkey);
  };

  delegateStake = (voteAccount: VoteAccountInfo, pubkey?: PublicKey) => {
    this.stakeAccountPubkey = pubkey || this.stakeAccountPubkey || new PublicKey("");

    const selectedValidatorPubkey = new PublicKey(voteAccount.votePubkey);

    const delegateTx = StakeProgram.delegate({
      stakePubkey: this.stakeAccountPubkey,
      authorizedPubkey: this.owner,
      votePubkey: selectedValidatorPubkey,
    });

    return delegateTx;
  };

  deactivateStake = (pubkey?: PublicKey) => {
    this.stakeAccountPubkey = pubkey || this.stakeAccountPubkey || new PublicKey("");

    const deactivateTx = StakeProgram.deactivate({
      stakePubkey: this.stakeAccountPubkey,
      authorizedPubkey: this.owner,
    });

    return deactivateTx;
  };

  withdrawStake = async (pubkey?: PublicKey) => {
    this.stakeAccountPubkey = pubkey || this.stakeAccountPubkey || new PublicKey("");
    const stakeBalance = await this.connection.getBalance(this.stakeAccountPubkey);

    const withdrawTx = StakeProgram.withdraw({
      stakePubkey: this.stakeAccountPubkey,
      authorizedPubkey: this.owner,
      toPubkey: this.owner,
      lamports: stakeBalance, // Withdraw the full balance at the time of the transaction
    });

    return withdrawTx;
  };
}

export default StakeClass;
