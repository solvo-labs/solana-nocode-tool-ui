import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { getTokensWithAccount } from "./token";
import { getMetadataPDA } from "./tokenRegister";

export const fetchUserTokens = async (connection: Connection, payer: PublicKey) => {
  const tokensFromWallet = await getTokensWithAccount(connection, payer);

  const getTokensMetadataPromises = tokensFromWallet.map((tf) => {
    return getMetadataPDA(tf.token, connection);
  });

  const metaDatas = await Promise.all(getTokensMetadataPromises);

  const finalData = tokensFromWallet.map((tf, index) => {
    return { hex: tf.token.toBase58(), amount: parseInt(tf.amount.toString()), metadata: metaDatas[index], supply: tf.supply };
  });

  return finalData;
};

export const getAccountBalance = async (connection: Connection, publicKey: PublicKey) => {
  const balance = await connection.getBalance(publicKey);

  return { balance, ui: balance / LAMPORTS_PER_SOL };
};
