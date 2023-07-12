import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  AccountLayout,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createInitializeMint2Instruction,
  getAccount,
  getAssociatedTokenAddressSync,
  getMinimumBalanceForRentExemptMint,
} from "@solana/spl-token";
import { Connection, Keypair, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";

export const createMint = async (connection: Connection, publicKey: PublicKey, decimal: number) => {
  const toAccount = Keypair.generate();
  const lamports = await getMinimumBalanceForRentExemptMint(connection);

  const transaction = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: publicKey,
      newAccountPubkey: toAccount.publicKey,
      space: MINT_SIZE,
      lamports,
      programId: TOKEN_PROGRAM_ID,
    }),

    createInitializeMint2Instruction(toAccount.publicKey, decimal, publicKey, publicKey, TOKEN_PROGRAM_ID)
  );

  return { transaction, toAccount };
};

export const getOrCreateAssociatedTokenAccount = (mint: PublicKey, payer: PublicKey, owner: PublicKey) => {
  const associatedToken = getAssociatedTokenAddressSync(mint, owner, false, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);

  const transaction = new Transaction().add(createAssociatedTokenAccountInstruction(payer, associatedToken, owner, mint, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID));

  return { transaction, associatedToken };
};

const getTokenBalance = async (connection: Connection, payer: PublicKey, mint: PublicKey) => {
  const { associatedToken } = getOrCreateAssociatedTokenAccount(mint, payer, payer);
  const tokenAccount = await getAccount(connection, associatedToken);
  const balance = await connection.getTokenAccountBalance(tokenAccount.address);

  return balance;
};

export const getTokensWithAccount = async (connection: Connection, payer: PublicKey) => {
  const tokenAccounts = await connection.getTokenAccountsByOwner(payer, {
    programId: TOKEN_PROGRAM_ID,
  });

  const promises = tokenAccounts.value.map((tokenAccount: { account: { data: any } }) => {
    const accountData = AccountLayout.decode(tokenAccount.account.data);

    return connection.getTokenSupply(accountData.mint);
  });

  const supplyData = await Promise.all(promises);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = tokenAccounts.value.map((tokenAccount: { account: { data: any } }, index) => {
    const accountData = AccountLayout.decode(tokenAccount.account.data);

    return { token: accountData.mint, amount: accountData.amount, supply: supplyData[index] };
  });

  return data;
};
