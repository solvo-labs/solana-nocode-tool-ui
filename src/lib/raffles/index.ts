import { BN, Idl, Program } from "@project-serum/anchor";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram } from "@solana/web3.js";
import { getLotteryAddress } from "./program";

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
