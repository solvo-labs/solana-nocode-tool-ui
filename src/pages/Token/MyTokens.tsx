import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import React, { useEffect } from "react";
import { fetchUserTokens } from "../../lib";

export const MyTokens = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  useEffect(() => {
    const init = async () => {
      if (publicKey) {
        const data = await fetchUserTokens(connection, publicKey);

        console.log(data);
      }
    };

    init();
  }, [connection, publicKey]);

  return <>My Tokens Page</>;
};
