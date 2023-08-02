import { AnchorProvider, Program, Idl } from "@project-serum/anchor";
import { useConnection, useAnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { getIdl } from "../lib/contract";
import toastr from "toastr";
import { CircularProgress } from "@mui/material";

export const ContractPage = () => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const [loading, setLoading] = useState<boolean>(true);
  const [program, setProgram] = useState<Program>();

  useEffect(() => {
    const init = async () => {
      if (wallet) {
        const provider = new AnchorProvider(connection, wallet, {
          commitment: "confirmed",
        });

        const PROGRAM_ID = new PublicKey("3MYQ4iEZC2XcRmB7U2XuasWxQPGKmorGBiuwBqJcHBni");

        try {
          const IDL = await getIdl(connection, PROGRAM_ID);

          const programInfo = new Program(IDL as Idl, PROGRAM_ID, provider);

          setProgram(programInfo);
        } catch {
          toastr.warning("Please check your contract id");
        }

        setLoading(false);
      }
    };

    init();
  }, [connection, wallet]);

  if (loading) {
    return (
      <div
        style={{
          height: "4rem",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </div>
    );
  }

  return <div>{JSON.stringify(program?.idl)}</div>;
};
