import { AnchorProvider, BN, Idl, Program } from "@project-serum/anchor";
import { PublicKey, LAMPORTS_PER_SOL, Connection } from "@solana/web3.js";

import IDL from "./idl.json";

import { LOTTERY_SEED, MASTER_SEED, PROGRAM_ID, TICKET_SEED } from "./constants";
import { Wallet } from "@project-serum/anchor/dist/cjs/provider";

// How to fetch our Program
export const getProgram = (connection: Connection, wallet: Wallet) => {
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });

  const program = new Program(IDL as Idl, PROGRAM_ID, provider);
  return program;
};

export const getMasterAddress = () => {
  return PublicKey.findProgramAddressSync([Buffer.from(MASTER_SEED)], PROGRAM_ID)[0];
};

export const getLotteryAddress = (id: string | number | Uint8Array | number[] | BN | Buffer) => {
  return PublicKey.findProgramAddressSync([Buffer.from(LOTTERY_SEED), new BN(id).toArrayLike(Buffer, "le", 4)], PROGRAM_ID)[0];
};

export const getTicketAddress = (lotteryPk: { toBuffer: () => Uint8Array | Buffer }, id: string | number | Uint8Array | number[] | BN | Buffer) => {
  return PublicKey.findProgramAddressSync([Buffer.from(TICKET_SEED), lotteryPk.toBuffer(), new BN(id).toArrayLike(Buffer, "le", 4)], PROGRAM_ID)[0];
};

// Return the lastTicket ID and multiply the ticket price and convert LAMPORTS PER SOL and convert it to String
export const getTotalPrize = (lottery: { lastTicketId: string | number | Uint8Array | number[] | BN | Buffer; ticketPrice: BN }) => {
  return new BN(lottery.lastTicketId).mul(lottery.ticketPrice).div(new BN(LAMPORTS_PER_SOL)).toString();
};
