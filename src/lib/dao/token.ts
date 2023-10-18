// ref https://github.com/solana-labs/governance-ui
import {
  MintLayout,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
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

  instructions.push(createInitializeMintInstruction(mintAccount.publicKey, decimals, ownerPk, freezeAuthorityPk));

  signers.push(mintAccount);
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mintInfo = MintLayout.decode(data) as any;

  if (mintInfo.mintAuthorityOption === 0) {
    mintInfo.mintAuthority = null;
  } else {
    mintInfo.mintAuthority = new PublicKey(mintInfo.mintAuthority);
  }

  // mintInfo.supply = u64.fromBuffer(mintInfo.supply);

  mintInfo.isInitialized = mintInfo.isInitialized != 0;

  if (mintInfo.freezeAuthorityOption === 0) {
    mintInfo.freezeAuthority = null;
  } else {
    mintInfo.freezeAuthority = new PublicKey(mintInfo.freezeAuthority);
  }
  return mintInfo;
}

export const withCreateAssociatedTokenAccount = async (instructions: TransactionInstruction[], mintPk: PublicKey, ownerPk: PublicKey, payerPk: PublicKey) => {
  const ataPk = await getAssociatedTokenAddress(mintPk, ownerPk, true);
  instructions.push(createAssociatedTokenAccountInstruction(payerPk, ataPk, ownerPk, mintPk));

  return ataPk;
};

export const withMintTo = async (instructions: TransactionInstruction[], mintPk: PublicKey, destinationPk: PublicKey, mintAuthorityPk: PublicKey, amount: number) => {
  instructions.push(createMintToInstruction(mintPk, destinationPk, mintAuthorityPk, amount, []));
};
