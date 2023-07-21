import { Idl, Program } from "@project-serum/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";

export const initMaster = async (program: Program<Idl>, masterAddress: PublicKey, owner: PublicKey) => {
  const txHash = await program.methods
    .initMaster()
    .accounts({
      master: masterAddress,
      payer: owner,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  return txHash;
};
