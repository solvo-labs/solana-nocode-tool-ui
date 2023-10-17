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

export const formatTimestamp = (seconds: number) => {
  const days = Math.floor(seconds / (3600 * 24));
  const remainingSeconds = seconds % (3600 * 24);
  const hours = Math.floor(remainingSeconds / 3600);

  if (days > 0 && hours === 0) {
    return `${days} d`;
  }

  if (days === 0 && hours > 0) {
    return `${hours} h`;
  }

  return `${days} d ${hours} h`;
};

export const fullFormatTimestamp = (seconds: number) => {
  const days = Math.floor(seconds / (3600 * 24));
  const remainingSeconds = seconds % (3600 * 24);
  const hours = Math.floor(remainingSeconds / 3600);
  const remainingMinutes = Math.floor((remainingSeconds % 3600) / 60);

  return `${days} d ${hours} h ${remainingMinutes} m`;
};
