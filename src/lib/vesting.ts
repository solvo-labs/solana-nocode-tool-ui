/* eslint-disable @typescript-eslint/no-unused-vars */
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { StreamClient, Cluster, BN, getBN, StreamType, StreamDirection } from "@streamflow/stream";
import { getTimestamp } from "./utils";
import { PublicKey } from "@solana/web3.js";
import { TokenData } from "../utils/types";

export const client = new StreamClient("https://api.devnet.solana.com", Cluster.Devnet, "confirmed");

export const vestTest = async (wallet: AnchorWallet, mint: TokenData, recipient: string) => {
  const createStreamParams = {
    sender: wallet, // Wallet/Keypair signing the transaction, creating and sending the stream.
    recipient, // Solana recipient address.
    mint: mint.hex, // SPL Token mint.
    start: getTimestamp() + 300, // Timestamp (in seconds) when the stream/token vesting starts.
    depositedAmount: getBN(10, mint.decimal), // depositing 100 tokens with 9 decimals mint.
    period: 1, // Time step (period) in seconds per which the unlocking occurs.
    cliff: 1701388800, // Vesting contract "cliff" timestamp in seconds.
    cliffAmount: new BN(10), // Amount unlocked at the "cliff" timestamp.
    amountPerPeriod: getBN(5, mint.decimal), // Release rate: how many tokens are unlocked per each period.
    name: "Test", // The stream name or subject.
    canTopup: false, // setting to FALSE will effectively create a vesting contract.
    cancelableBySender: true, // Whether or not sender can cancel the stream.
    cancelableByRecipient: false, // Whether or not recipient can cancel the stream.
    transferableBySender: true, // Whether or not sender can transfer the stream.
    transferableByRecipient: false, // Whether or not recipient can transfer the stream.
    automaticWithdrawal: true, // Whether or not a 3rd party (e.g. cron job, "cranker") can initiate a token withdraw/transfer.
    withdrawalFrequency: 10, // Relevant when automatic withdrawal is enabled. If greater than 0 our withdrawor will take care of withdrawals. If equal to 0 our withdrawor will skip, but everyone else can initiate withdrawals.
    partner: null, //  (optional) Partner's wallet address (string | null).
  };

  try {
    const { ixs, tx, metadata } = await client.create(createStreamParams);
    console.log(ixs);
    console.log(tx);
    console.log(metadata.publicKey.toBase58());
  } catch (exception) {
    // handle exception
    console.log(exception);
  }
};

export const vestMultiTest = async (wallet: AnchorWallet, mint: TokenData, recipients: string[]) => {
  const recipientsData = recipients.map((rp: string) => {
    return {
      recipient: rp, // Solana recipient address.
      depositedAmount: getBN(10, mint.decimal), // depositing 10 tokens with 9 decimals mint.
      name: "Test", // The stream name/subject.
      cliffAmount: getBN(10, mint.decimal), // amount released on cliff for this recipient
      amountPerPeriod: getBN(1, mint.decimal), //amount released every specified period epoch
    };
  });

  const createMultiStreamsParams = {
    sender: wallet, // Wallet/Keypair signing the transaction, creating and sending the stream.
    recipientsData, // Array of Solana recipient address.
    mint: mint.hex, // SPL Token mint.
    start: getTimestamp() + 400, // Timestamp (in seconds) when the stream/token vesting starts.
    period: 1, // Time step (period) in seconds per which the unlocking occurs.
    cliff: 1701388800, // Vesting contract "cliff" timestamp in seconds.
    canTopup: true, // setting to FALSE will effectively create a vesting contract.
    cancelableBySender: true, // Whether or not sender can cancel the stream.
    cancelableByRecipient: false, // Whether or not recipient can cancel the stream.
    transferableBySender: true, // Whether or not sender can transfer the stream.
    transferableByRecipient: false, // Whether or not recipient can transfer the stream.
    automaticWithdrawal: false, // Whether or not a 3rd party can initiate withdraw in the name of recipient (currently not used, set it to FALSE).
    partner: null, //  (optional) Partner's wallet address (string | null).
  };

  try {
    const { txs } = await client.createMultiple(createMultiStreamsParams);
    console.log(txs);
  } catch (exception) {
    console.log(exception);
  }
};

export const getVestingMyOwn = async (publicKey: PublicKey) => {
  try {
    const streams = await client.get({
      wallet: publicKey, // Wallet signing the transaction.
      type: StreamType.All, // (optional) Type, default is StreamType.All
      direction: StreamDirection.All, // (optional) Direction, default is StreamDirection.All)
    });

    return streams;
  } catch (exception) {
    console.log(exception);
    // handle exception
  }
};

export const withdraw = async (wallet: AnchorWallet, id: string, amount: number, decimals: number) => {
  const withdrawStreamParams = {
    invoker: wallet, // Wallet/Keypair signing the transaction.
    id: id, // Identifier of a stream to be withdrawn from.
    amount: getBN(amount, decimals), // Requested amount to withdraw. If stream is completed, the whole amount will be withdrawn.
  };

  try {
    const { ixs, tx } = await client.withdraw(withdrawStreamParams);

    return { ixs, tx };
  } catch (exception) {
    // handle exception
  }
};
