import { useEffect } from "react";
import { getLotteryAddress, getMasterAddress, getProgram, getTicketAddress, getTotalPrize } from "../../lib/raffles/program";
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { BN } from "@project-serum/anchor";
import { LAMPORTS_PER_SOL, SystemProgram } from "@solana/web3.js";
import { error } from "toastr";

export const Raffle = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const wallet = useAnchorWallet();

  useEffect(() => {
    const init = async () => {
      if (wallet) {
        const program = getProgram(connection, wallet);

        const masterAddress = await getMasterAddress();
        const master = await program.account.master.fetch(masterAddress);
        const lotteryAddress = await getLotteryAddress(master.lastId as any);

        const lottery = await program.account.lottery.fetch(lotteryAddress);

        const totalPrize = getTotalPrize(lottery as any);

        console.log(lottery);
        console.log(totalPrize);

        // const userTickets = await program.account.ticket.all([
        //   {
        //     memcmp: {
        //       bytes: bs58.encode(new BN(lottery.lastId as any).toArrayLike(Buffer, "le", 4)),
        //       offset: 12,
        //     },
        //   },
        //   { memcmp: { bytes: wallet.publicKey.toBase58(), offset: 16 } },
        // ]);
      }
    };

    init();
  }, [connection, wallet]);

  const create = async () => {
    const lotteryAddress = await getLotteryAddress(51 + 1);
    const program = getProgram(connection, wallet!);
    const masterAddress = await getMasterAddress();

    const txHash = await program.methods
      .createLottery(new BN(0.1).mul(new BN(LAMPORTS_PER_SOL)))
      .accounts({
        lottery: lotteryAddress,
        master: masterAddress,
        authority: publicKey || "",
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log(txHash);
  };

  const buyTicket = async () => {
    try {
      const program = getProgram(connection, wallet!);
      const lotteryAddress = await getLotteryAddress(52);
      const lottery = await program.account.lottery.fetch(lotteryAddress);

      const txHash = await program.methods.buyTicket(52).accounts({
        lottery: lotteryAddress,
        ticket: await getTicketAddress(lotteryAddress, (lottery.lastTicketId as number) + 1),
        buyer: publicKey || "",
        systemProgram: SystemProgram.programId,
      });

      console.log(txHash);
    } catch (err) {
      console.log(err);
    }
  };

  const pickWinner = async () => {
    try {
      const lotteryId = 52;
      const program = getProgram(connection, wallet!);
      const lotteryAddress = await getLotteryAddress(lotteryId);
      const lottery = await program.account.lottery.fetch(lotteryAddress);

      const txHash = await program.methods
        .pickWinner(lotteryId)
        .accounts({
          lottery: lotteryAddress,
          authority: publicKey || "",
        })
        .rpc();

      console.log(txHash);
    } catch (err) {
      console.log(error);
    }
  };

  const claim = async () => {
    try {
      const lotteryId = 52;
      const program = getProgram(connection, wallet!);
      const lotteryAddress = await getLotteryAddress(lotteryId);
      const lottery = await program.account.lottery.fetch(lotteryAddress);
      console.log(lottery);

      const txHash = await program.methods
        .claimPrize(lotteryId, lottery.winnerId as number)
        .accounts({
          lottery: lotteryAddress,
          ticket: await getTicketAddress(lotteryAddress, lottery.winnerId as number),
          authority: publicKey || "",
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log(txHash);
    } catch (err) {
      console.log(error);
    }
  };

  return (
    <div>
      <span>Hello raffle</span>
      <div onClick={create}>Create</div>
      <div onClick={buyTicket}>Buy</div>
      <div onClick={pickWinner}>Winner</div>
      <div onClick={claim}>Claim</div>
    </div>
  );
};
