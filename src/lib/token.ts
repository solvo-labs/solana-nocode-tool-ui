import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  AccountLayout,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createBurnInstruction,
  createCloseAccountInstruction,
  createFreezeAccountInstruction,
  createInitializeMint2Instruction,
  getAccount,
  getAssociatedTokenAddressSync,
  getMinimumBalanceForRentExemptMint,
  Account,
  createMintToInstruction,
} from "@solana/spl-token";
import { Connection, Keypair, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";

export const createMint = async (connection: Connection, publicKey: PublicKey, freezeAuthority: PublicKey, decimal: number) => {
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

    createInitializeMint2Instruction(toAccount.publicKey, decimal, publicKey, freezeAuthority, TOKEN_PROGRAM_ID)
  );

  return { transaction, toAccount };
};

export const getOrCreateAssociatedTokenAccount = async (mint: PublicKey, payer: PublicKey, owner: PublicKey, connection: Connection) => {
  let account: Account;
  const associatedToken = getAssociatedTokenAddressSync(mint, owner, false, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);

  try {
    account = await getAccount(connection, associatedToken);
    return { associatedToken, account };
  } catch {
    const transaction = new Transaction().add(createAssociatedTokenAccountInstruction(payer, associatedToken, owner, mint, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID));
    return { associatedToken, transaction };
  }
};

export const getTokenBalance = async (connection: Connection, payer: PublicKey, mint: PublicKey) => {
  const { associatedToken } = await getOrCreateAssociatedTokenAccount(mint, payer, payer, connection);
  const tokenAccount = await getAccount(connection, associatedToken);
  const balance = await connection.getTokenAccountBalance(tokenAccount.address);

  return balance;
};

export const getTokensWithAccount = async (connection: Connection, payer: PublicKey, mint?: PublicKey) => {
  const tokenAccounts = await connection.getTokenAccountsByOwner(
    payer,
    mint
      ? {
          programId: TOKEN_PROGRAM_ID,
          mint,
        }
      : { programId: TOKEN_PROGRAM_ID }
  );

  const promises = tokenAccounts.value.map((tokenAccount: { account: { data: Uint8Array } }) => {
    const accountData = AccountLayout.decode(tokenAccount.account.data);
    return connection.getTokenSupply(accountData.mint);
  });

  const supplyData = await Promise.all(promises);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = tokenAccounts.value.map((tokenAccount: { account: { data: any } }, index) => {
    const accountData = AccountLayout.decode(tokenAccount.account.data);
    return {
      token: accountData.mint,
      amount: accountData.amount,
      supply: supplyData[index],
      owner: accountData.owner.toBase58(),
    };
  });

  return data;
};

export const burnToken = async (owner: PublicKey, mint: PublicKey, burnAccount: PublicKey, amount: number) => {
  const ix = createBurnInstruction(burnAccount, mint, owner, amount);

  return ix;
};

export const freezeAccount = async (tokenAccount: PublicKey, mint: PublicKey, owner: PublicKey) => {
  const ix = createFreezeAccountInstruction(tokenAccount, mint, owner);

  return ix;
};

export const closeAccount = async (closeaccount: PublicKey, destination: PublicKey, authority: PublicKey) => {
  const ix = createCloseAccountInstruction(closeaccount, destination, authority);

  return ix;
};

export const getLargestAccounts = async (connection: Connection, mint: PublicKey) => {
  return await connection.getTokenLargestAccounts(mint);
};

export const mintTo = (mint: PublicKey, address: PublicKey, publicKey: PublicKey, amount: number, decimal: number) => {
  const ix = new Transaction().add(createMintToInstruction(mint, address, publicKey, amount * Math.pow(10, decimal), [], TOKEN_PROGRAM_ID));

  return ix;
};
