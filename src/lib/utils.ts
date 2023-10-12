import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

export const getTimestamp = () => {
  return Math.floor(Date.now() / 1000);
};

export const airdrop = async (connection: Connection, publicKey: PublicKey) => {
  const signature = await connection.requestAirdrop(publicKey, LAMPORTS_PER_SOL);
  await connection.confirmTransaction(signature);
};

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
