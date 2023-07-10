import { Metadata, PROGRAM_ID, createCreateMetadataAccountV3Instruction } from "@metaplex-foundation/mpl-token-metadata";
import { utils } from "@project-serum/anchor";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";

// ref https://github.com/loopcreativeandy/video-tutorial-resources/blob/main/mpl/mpl_tutorial.ts
export const register = (mintPublickey: string, publicKey: PublicKey, metadata: { name: string; symbol: string }) => {
  const mint = new PublicKey(mintPublickey);

  const seed1 = Buffer.from(utils.bytes.utf8.encode("metadata"));

  const seed2 = Buffer.from(PROGRAM_ID.toBytes());

  const seed3 = Buffer.from(mint.toBytes());

  const [metadataPDA] = PublicKey.findProgramAddressSync([seed1, seed2, seed3], PROGRAM_ID);

  const accounts = {
    metadata: metadataPDA,
    mint,
    mintAuthority: publicKey,
    payer: publicKey,
    updateAuthority: publicKey,
  };

  const dataV2 = {
    name: metadata.name,
    symbol: metadata.symbol,
    // we don't need that
    sellerFeeBasisPoints: 0,
    creators: null,
    collection: null,
    uses: null,
    uri: "",
  };

  const args = {
    createMetadataAccountArgsV3: {
      data: dataV2,
      isMutable: true,
      collectionDetails: null,
    },
  };
  const ix = createCreateMetadataAccountV3Instruction(accounts, args);

  const tx = new Transaction();
  tx.add(ix);

  return tx;
};

// https://stackoverflow.com/questions/69900783/how-to-get-metadata-from-a-token-adress-using-web3-js-on-solana
export const getMetadataPDA = async (mint: PublicKey, connection: Connection) => {
  try {
    const [publicKey] = await PublicKey.findProgramAddress([Buffer.from("metadata"), PROGRAM_ID.toBuffer(), mint.toBuffer()], PROGRAM_ID);

    const res = await Metadata.fromAccountAddress(connection, publicKey);

    return res;
  } catch {
    return undefined;
  }
};
