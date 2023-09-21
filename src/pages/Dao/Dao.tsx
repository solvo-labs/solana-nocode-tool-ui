import React, { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { DAO } from "../../lib/dao";
import { CircularProgress } from "@mui/material";
import { Realm, ProgramAccount } from "@solana/spl-governance";

import toastr from "toastr";

export const Dao = () => {
  const [loading, setLoading] = useState<boolean>(true);

  const [daoInstance, setDaoInstance] = useState<DAO>();
  const [daos, setDaos] = useState<ProgramAccount<Realm>[]>([]);
  const [myDaos, setMyDaos] = useState<ProgramAccount<Realm>[]>([]);
  const { publicKey } = useWallet();

  const { connection } = useConnection();

  useEffect(() => {
    if (publicKey) {
      const daoClass = new DAO(connection, publicKey);
      setDaoInstance(daoClass);
    }
  }, [connection, publicKey]);

  useEffect(() => {
    const fetch = async () => {
      if (daoInstance) {
        try {
          const { allDaos, myDaos } = await daoInstance.fetchDaos();

          setDaos(allDaos);
          setMyDaos(myDaos);
          setLoading(false);
        } catch {
          toastr.error("someting went wrong");
        }
      }
    };

    fetch();
  }, [daoInstance]);

  // console.log(daos[0].pubkey.toBase58());
  // console.log(daos[0].account.name);

  if (loading) {
    return (
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
        }}
      >
        <CircularProgress />
      </div>
    );
  }

  return (
    <div>
      {daos.map((dao) => {
        return <span>{dao.account.name}</span>;
      })}
    </div>
  );
};
