import { MULTISIG_SIZE, TOKEN_PROGRAM_ID, createInitializeMultisigInstruction, getMinimumBalanceForRentExemptMultisig } from "@solana/spl-token";
import { Connection, Keypair, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";

export const createMultiSig = async (connection: Connection, owner: PublicKey, signatureCount: number, signers: PublicKey[]) => {
  const lamports = await getMinimumBalanceForRentExemptMultisig(connection);
  const newAccount = Keypair.generate();

  const transaction = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: owner,
      newAccountPubkey: newAccount.publicKey,
      space: MULTISIG_SIZE,
      lamports,
      programId: TOKEN_PROGRAM_ID,
    }),
    createInitializeMultisigInstruction(newAccount.publicKey, signers, signatureCount)
  );

  return { transaction, newAccount };
};
