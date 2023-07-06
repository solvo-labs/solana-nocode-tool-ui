import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createInitializeMint2Instruction,
  getAssociatedTokenAddressSync,
  getMinimumBalanceForRentExemptMint,
} from "@solana/spl-token";
import { Connection, Keypair, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";

export const createMint = async (connection: Connection, publicKey: PublicKey) => {
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

    createInitializeMint2Instruction(toAccount.publicKey, 9, publicKey, publicKey, TOKEN_PROGRAM_ID)
  );

  return { transaction, toAccount };
};

export const getOrCreateAssociatedTokenAccount = (mint: PublicKey, owner: PublicKey) => {
  const associatedToken = getAssociatedTokenAddressSync(mint, owner, false, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);

  const transaction = new Transaction().add(createAssociatedTokenAccountInstruction(owner, associatedToken, owner, mint, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID));

  return { transaction, associatedToken };
};
