import { utf8 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { inflate } from "pako";
import { Connection, PublicKey } from "@solana/web3.js";
import { decodeIdlAccount } from "@project-serum/anchor/dist/cjs/idl";

export const getIdl = async (connection: Connection, programId: PublicKey) => {
  const base = PublicKey.findProgramAddressSync([], programId)[0];

  const idlAddress = await PublicKey.createWithSeed(base, "anchor:idl", programId);

  const idlAccountInfo = await connection.getAccountInfo(idlAddress);

  const idlAccount = decodeIdlAccount(idlAccountInfo!.data.slice(8)); // chop off discriminator

  const inflatedIdl = inflate(idlAccount.data);

  const idlJson = JSON.parse(utf8.decode(inflatedIdl));
  console.log("idlJson", idlJson);
  return idlJson;
};
