/* eslint-disable @typescript-eslint/no-unused-vars */
import { StreamflowSolana, Types, getBN, getNumberFromBN } from "@streamflow/stream";
import { getTimestamp } from "./utils";
import { TokenData } from "../utils/types";
import { SignerWalletAdapter } from "@solana/wallet-adapter-base";
import { StreamDirection, StreamType } from "@streamflow/stream/dist/common/types";

export const client = new StreamflowSolana.SolanaStreamClient("https://api.devnet.solana.com", Types.ICluster.Devnet, "confirmed");

export const vestTest = async (wallet: SignerWalletAdapter, mint: TokenData, recipient: string, amount: number, amountPerPeriod: number, cliffAmount: number) => {
  const createStreamParams = {
    tokenId: mint.hex, // SPL token mint or Aptos Coin type
    recipient, // Recipient address (base58 string for Solana)
    amount: getBN(amount, mint.decimal), // Deposited amount of tokens (using smallest denomination).
    amountPerPeriod: getBN(amountPerPeriod, mint.decimal), // Release rate: how many tokens are unlocked per each period.
    cliff: getTimestamp() + 120, // Vesting contract "cliff" timestamp in seconds.
    cliffAmount: getBN(cliffAmount, mint.decimal), // Amount (smallest denomination) unlocked at the "cliff" timestamp.
    name: "Test", // The stream name or subject.
    period: 1, // Time step (period) in seconds per which the unlocking occurs.
    start: getTimestamp() + 60, // Timestamp (in seconds) when the stream/token vesting starts.
    canTopup: false, // setting to FALSE will effectively create a vesting contract.
    cancelableBySender: true, // Wether or not sender can cancel the stream.
    cancelableByRecipient: false, // Wether or not recipient can cancel the stream.
    transferableBySender: true, // Wether or not sender can transfer the stream.
    transferableByRecipient: false, // Wether or not recipient can transfer the stream.
    automaticWithdrawal: true, // [optional] Wether or not a 3rd party (e.g. cron job, "cranker") can initiate a token withdraw/transfer.
    withdrawalFrequency: 0, // [optional] Relevant when automatic withdrawal is enabled. If greater than 0 our withdrawor will take care of withdrawals. If equal to 0 our withdrawor will skip, but everyone else can initiate withdrawals.
    canPause: false, // [optional] [WIP] Wether stream is Pausable
  };

  const solanaParams = { sender: wallet };

  try {
    const { ixs, metadataId } = await client.create(createStreamParams, solanaParams);
    console.log(ixs);
    console.log(metadataId);
  } catch (exception) {
    // handle exception
    console.log(exception);
  }
};

export const getVestingMyOwn = async (address: string) => {
  try {
    const streams = await client.get({
      address, // Wallet signing the transaction.
      type: StreamType.All, // (optional) Type, default is StreamType.All
      direction: StreamDirection.All, // (optional) Direction, default is StreamDirection.All)
    });

    return streams;
  } catch (exception) {
    // handle exception
  }
};

export const withdraw = async (wallet: SignerWalletAdapter, id: string, amountComing: number, decimals: number) => {
  const withdrawStreamParams = {
    id, // Identifier of a stream to be withdrawn from.
    amount: getBN(amountComing, decimals), // Requested amount to withdraw. If stream is completed, the whole amount will be withdrawn.
  };

  const solanaParams = {
    invoker: wallet, // Wallet/Keypair signing the transaction.
  };

  try {
    const { ixs } = await client.withdraw(withdrawStreamParams, solanaParams);
    console.log(ixs);
  } catch (exception) {
    console.log(exception);
    // handle exception
  }
};

export const getStreamById = async (id: string) => {
  try {
    const stream = await client.getOne({
      id, // Identifier of a stream that is fetched.
    });

    return stream;
  } catch (exception) {
    // handle exception
  }
};

// export const unlock = async (id: string) => {
//   const stream = await client.getOne(id);

//   const unlocked = stream.unlocked(getTimestamp(), 9); // bn amount unlocked at the tsInSeconds

//   const withdrawn = stream.withdrawnAmount; // bn amount withdrawn already
//   console.log("wih", withdrawn.toNumber());
//   const remaining = stream.withdrawnAmount; // bn amount of remaining funds
//   console.log("remaining", remaining.toNumber() / Math.pow(10, 9));
// };
