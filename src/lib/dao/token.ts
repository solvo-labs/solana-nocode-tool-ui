/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore

// ref https://github.com/solana-labs/governance-ui
import { ASSOCIATED_TOKEN_PROGRAM_ID, MintLayout, TOKEN_PROGRAM_ID, Token, u64 } from "@solana/spl-token";
import { Connection, Keypair, PublicKey, SystemProgram, TransactionInstruction } from "@solana/web3.js";

export const withCreateMint = async (
  connection: Connection,
  instructions: TransactionInstruction[],
  signers: Keypair[],
  ownerPk: PublicKey,
  freezeAuthorityPk: PublicKey | null,
  decimals: number,
  payerPk: PublicKey
) => {
  const mintRentExempt = await connection.getMinimumBalanceForRentExemption(MintLayout.span);

  const mintAccount = new Keypair();

  instructions.push(
    SystemProgram.createAccount({
      fromPubkey: payerPk,
      newAccountPubkey: mintAccount.publicKey,
      lamports: mintRentExempt,
      space: MintLayout.span,
      programId: TOKEN_PROGRAM_ID,
    })
  );
  signers.push(mintAccount);

  instructions.push(Token.createInitMintInstruction(TOKEN_PROGRAM_ID, mintAccount.publicKey, decimals, ownerPk, freezeAuthorityPk));
  return mintAccount.publicKey;
};

export async function tryGetMint(connection: Connection, publicKey: PublicKey) {
  try {
    const result = await connection.getAccountInfo(publicKey);
    const data = Buffer.from(result!.data);
    const account = parseMintAccountData(data);
    return {
      publicKey,
      account,
    };
  } catch (ex) {
    console.error(`Can't fetch mint ${publicKey?.toBase58()} @ ${connection.rpcEndpoint}`, ex);
    return undefined;
  }
}

export function parseMintAccountData(data: Buffer) {
  const mintInfo = MintLayout.decode(data) as unknown as any;

  if (mintInfo.mintAuthorityOption === 0) {
    mintInfo.mintAuthority = null;
  } else {
    mintInfo.mintAuthority = new PublicKey(mintInfo.mintAuthority);
  }

  mintInfo.supply = u64.fromBuffer(mintInfo.supply);
  mintInfo.isInitialized = mintInfo.isInitialized != 0;

  if (mintInfo.freezeAuthorityOption === 0) {
    mintInfo.freezeAuthority = null;
  } else {
    mintInfo.freezeAuthority = new PublicKey(mintInfo.freezeAuthority);
  }
  return mintInfo;
}

export const withCreateAssociatedTokenAccount = async (instructions: TransactionInstruction[], mintPk: PublicKey, ownerPk: PublicKey, payerPk: PublicKey) => {
  const ataPk = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    mintPk,
    ownerPk, // owner
    true
  );

  instructions.push(Token.createAssociatedTokenAccountInstruction(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, mintPk, ataPk, ownerPk, payerPk));

  return ataPk;
};

export const withMintTo = async (instructions: TransactionInstruction[], mintPk: PublicKey, destinationPk: PublicKey, mintAuthorityPk: PublicKey, amount: number | u64) => {
  instructions.push(Token.createMintToInstruction(TOKEN_PROGRAM_ID, mintPk, destinationPk, mintAuthorityPk, [], amount));
};
