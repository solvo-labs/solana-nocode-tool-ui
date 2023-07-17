import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { createStakeAccount, delegateStake, fetchAllStakes, getValidators } from "../../lib/stake";
import { AccountInfo, ParsedAccountData, PublicKey, Transaction, VoteAccountInfo } from "@solana/web3.js";
import { Button } from "@mui/material";

export const Stake = () => {
  const [validators, setValidators] = useState<VoteAccountInfo[]>([]);
  const [stakes, setStakes] = useState<any[]>([]);

  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  useEffect(() => {
    const init = async () => {
      if (publicKey) {
        const validatorsData = await getValidators(connection);
        setValidators(validatorsData);

        const allStakes = await fetchAllStakes(connection, publicKey);
        setStakes(allStakes);

        // const demoAccount = allStakes[0];
        // console.log(demoAccount.account.lamports, "all");
        // console.log(demoAccount.account.data.parsed.info.meta.rentExemptReserve, "rent");
        // console.log(demoAccount.account.data.parsed.info.stake.delegation.stake, "active stake");
      }
    };

    init();
  }, [connection, publicKey]);

  const startStake = async () => {
    if (publicKey) {
      const { stakeAccount, createStakeAccountTx } = await createStakeAccount(connection, publicKey, 0.03);

      const delegateTx = delegateStake(stakeAccount.publicKey, publicKey, validators[1]);

      const transaction = new Transaction();

      transaction.add(createStakeAccountTx);
      transaction.add(delegateTx);

      const {
        context: { slot: minContextSlot },
        value: { blockhash, lastValidBlockHeight },
      } = await connection.getLatestBlockhashAndContext();

      const signature = await sendTransaction(transaction, connection, { minContextSlot, signers: [stakeAccount] });
      await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature: signature });
    }
  };

  return <Button onClick={startStake}>TRY</Button>;
};
