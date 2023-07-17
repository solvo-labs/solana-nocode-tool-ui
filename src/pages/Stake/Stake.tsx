import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { fetchAllStakes, getValidators } from "../../lib/stake";
import { AccountInfo, GetProgramAccountsFilter, ParsedAccountData, PublicKey, StakeProgram, VoteAccountInfo } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

export const Stake = () => {
  const [validators, setValidators] = useState<VoteAccountInfo[]>([]);
  const [stakes, setStakes] = useState<{ pubkey: PublicKey; account: AccountInfo<Buffer | ParsedAccountData>[] }[]>([]);

  const { connection } = useConnection();
  const { publicKey } = useWallet();

  useEffect(() => {
    const init = async () => {
      if (publicKey) {
        const validators = await getValidators(connection);
        const allStakes = await fetchAllStakes(connection, publicKey);

        console.log(allStakes);
      }
    };

    init();
  }, [connection, publicKey]);

  return <>STAKE</>;
};
