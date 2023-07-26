import { useWallet } from "@solana/wallet-adapter-react";
import React, { useEffect, useState } from "react";
import { getVestingMyOwn } from "../../lib/vesting";
import { Stream } from "@streamflow/stream/dist/solana";

export const VestingList = () => {
  const { publicKey } = useWallet();
  const [loading, setLoading] = useState<boolean>(true);
  const [vestingList, setVestingList] = useState<[string, Stream][] | undefined>([]);

  useEffect(() => {
    const init = async () => {
      if (publicKey) {
        // CMiHYdJFr1sGYhT1y1Svy4KyhASweq4yoTGtEFVZi5cP
        const data = await getVestingMyOwn(publicKey.toBase58());

        setVestingList(data);

        console.log(data);

        setLoading(false);
      }
    };

    init();
  }, [publicKey]);

  return <span>Vesting List</span>;
};
