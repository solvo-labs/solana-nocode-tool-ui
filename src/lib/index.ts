import { AccountInfo, Connection, LAMPORTS_PER_SOL, ParsedAccountData, PublicKey, RpcResponseAndContext } from "@solana/web3.js";
import { getTokensWithAccount } from "./token";
import { getMetadataPDA } from "./tokenRegister";
import { TokenData } from "../utils/types";

export const fetchUserTokens = async (connection: Connection, payer: PublicKey, mint?: PublicKey): Promise<TokenData[]> => {
  const tokensFromWallet = await getTokensWithAccount(connection, payer, mint);

  const getTokensMetadataPromises = tokensFromWallet.map((tf) => {
    return getMetadataPDA(tf.token, connection);
  });

  const metaDatas = await Promise.all(getTokensMetadataPromises);

  const finalData = tokensFromWallet.map((tf, index) => {
    return { hex: tf.token.toBase58(), amount: parseInt(tf.amount.toString()), metadata: metaDatas[index], supply: tf.supply, decimal: tf.supply.value.decimals, owner: tf.owner };
  });

  return finalData;
};

export const getAccountBalance = async (connection: Connection, publicKey: PublicKey) => {
  const balance = await connection.getBalance(publicKey);

  return { balance, ui: balance / LAMPORTS_PER_SOL };
};

export const isAccountActive = async (connection: Connection, publicKey: PublicKey): Promise<boolean> => {
  const account = await connection.getAccountInfo(publicKey);

  if (account) return account?.executable;

  return false;
};

export const accountState = async (
  connection: Connection,
  publicKey: PublicKey
): Promise<RpcResponseAndContext<AccountInfo<Buffer | ParsedAccountData | string> | null> | undefined> => {
  const account = await connection.getParsedAccountInfo(publicKey);

  if (account && account.value && !Buffer.isBuffer(account.value.data)) return account.value?.data.parsed.info.state;
  return undefined;
};
