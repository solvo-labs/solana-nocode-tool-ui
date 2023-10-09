import { useEffect, useState } from "react";
import { DAO } from "../../lib/dao";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";

export const CreateDao = () => {
  const [daoInstance, setDaoInstance] = useState<DAO>();

  const wallet = useAnchorWallet();

  const { connection } = useConnection();

  useEffect(() => {
    if (wallet) {
      const dao = new DAO(connection, wallet);
      setDaoInstance(dao);
    }
  }, [connection, wallet]);

  const createDao = async () => {
    if (daoInstance) {
      try {
        const result = await daoInstance.createMultisigDao(
          [new PublicKey("G1xDSUJrQEFtJ1Z9ME1qcRs2w61AP5mYDDpEVBZrhPuW"), new PublicKey("GVfARe6xnujtzGbgDf1drSneKECpa65HPhQJkS6QeCz2")],
          "namenamename",
          60
        );

        console.log(result);
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <>
      <span>Create Dao</span>
      <button onClick={createDao}>Create</button>
    </>
  );
};
