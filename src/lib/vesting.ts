/* eslint-disable @typescript-eslint/no-unused-vars */
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { StreamClient, Cluster, BN, getBN } from "@streamflow/stream";
import { getTimestamp } from "./utils";
export const client = new StreamClient("https://api.devnet.solana.com", Cluster.Devnet, "confirmed");

export const vestTest = async (wallet: AnchorWallet, mint: string, recipient: string) => {
  const createStreamParams = {
    sender: wallet, // Wallet/Keypair signing the transaction, creating and sending the stream.
    recipient, // Solana recipient address.
    mint, // SPL Token mint.
    start: getTimestamp() + 300, // Timestamp (in seconds) when the stream/token vesting starts.
    depositedAmount: getBN(99, 9), // depositing 100 tokens with 9 decimals mint.
    period: 1, // Time step (period) in seconds per which the unlocking occurs.
    cliff: 1701388800, // Vesting contract "cliff" timestamp in seconds.
    cliffAmount: new BN(10), // Amount unlocked at the "cliff" timestamp.
    amountPerPeriod: getBN(5, 9), // Release rate: how many tokens are unlocked per each period.
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
    console.log(metadata);
  } catch (exception) {
    // handle exception
    console.log(exception);
  }
};

// export const vestTest = async (wallet: AnchorWallet) => {
//   const recipients = [
//     {
//       recipient: "9U3AaVHiVhncxnQQGRabQCb1wy7SYJStWbLJXhYXPJ1f", // Solana recipient address.
//       depositedAmount: getBN(10, 9), // depositing 10 tokens with 9 decimals mint.
//       name: "Test", // The stream name/subject.
//       cliffAmount: getBN(10, 9), // amount released on cliff for this recipient
//       amountPerPeriod: getBN(1, 9), //amount released every specified period epoch
//     },
//   ];

//   const createMultiStreamsParams = {
//     sender: wallet, // Wallet/Keypair signing the transaction, creating and sending the stream.
//     recipientsData: recipients, // Array of Solana recipient address.
//     mint: "CV3KoKnbEAdt7W6xfnTmqAk93EWVLpMbctFiqzMCLht7", // SPL Token mint.
//     start: getTimestamp(), // Timestamp (in seconds) when the stream/token vesting starts.
//     period: 1, // Time step (period) in seconds per which the unlocking occurs.
//     cliff: 1701388800, // Vesting contract "cliff" timestamp in seconds.
//     canTopup: true, // setting to FALSE will effectively create a vesting contract.
//     cancelableBySender: true, // Whether or not sender can cancel the stream.
//     cancelableByRecipient: false, // Whether or not recipient can cancel the stream.
//     transferableBySender: true, // Whether or not sender can transfer the stream.
//     transferableByRecipient: false, // Whether or not recipient can transfer the stream.
//     automaticWithdrawal: false, // Whether or not a 3rd party can initiate withdraw in the name of recipient (currently not used, set it to FALSE).
//     partner: null, //  (optional) Partner's wallet address (string | null).
//   };

//   try {
//     const { txs } = await client.createMultiple(createMultiStreamsParams);
//     console.log(txs);
//   } catch (exception) {
//     console.log(exception);
//   }
// };
