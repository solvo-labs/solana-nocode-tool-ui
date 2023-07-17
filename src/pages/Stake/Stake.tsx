import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { Transaction, VoteAccountInfo } from "@solana/web3.js";
import { Button } from "@mui/material";
import StakeClass from "../../lib/stakeClass";

export const Stake = () => {
  const [validators, setValidators] = useState<VoteAccountInfo[]>([]);
  const [stakes, setStakes] = useState<any[]>([]);
  const [stakeClassInstance, setStakeClassInstance] = useState<StakeClass>();

  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  useEffect(() => {
    const init = async () => {
      if (publicKey) {
        const stakeClass = new StakeClass(connection, publicKey);
        setStakeClassInstance(stakeClass);

        const validatorsData = await stakeClass.getValidators();
        setValidators(validatorsData);

        const allStakes = await stakeClass.fetchAllStakes();
        setStakes(allStakes);

        console.log(allStakes);

        // const demoAccount = allStakes[0];
        // console.log(demoAccount.account.lamports, "all");
        // console.log(demoAccount.account.data.parsed.info.meta.rentExemptReserve, "rent");
        // console.log(demoAccount.account.data.parsed.info.stake.delegation.stake, "active stake");
      }
    };

    init();
  }, [connection, publicKey]);

  const startStake = async () => {
    if (publicKey && stakeClassInstance) {
      const transaction1 = await stakeClassInstance.createStakeAccount(0.04);
      const transaction2 = stakeClassInstance.delegateStake(validators[2]);

      if (transaction2) {
        const transaction = new Transaction();

        transaction.add(transaction1);
        transaction.add(transaction2);

        const {
          context: { slot: minContextSlot },
          value: { blockhash, lastValidBlockHeight },
        } = await connection.getLatestBlockhashAndContext();

        if (stakeClassInstance.stakeAccount) {
          const signature = await sendTransaction(transaction, connection, { minContextSlot, signers: [stakeClassInstance.stakeAccount] });
          await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature: signature });
        }
      }
    }
  };

  // const startStake = async () => {
  //   if (publicKey) {
  //     const { stakeAccount, createStakeAccountTx } = await createStakeAccount(connection, publicKey, 0.03);

  //     const delegateTx = delegateStake(stakeAccount.publicKey, publicKey, validators[1]);

  //     const transaction = new Transaction();

  //     transaction.add(createStakeAccountTx);
  //     transaction.add(delegateTx);

  //     const {
  //       context: { slot: minContextSlot },
  //       value: { blockhash, lastValidBlockHeight },
  //     } = await connection.getLatestBlockhashAndContext();

  //     const signature = await sendTransaction(transaction, connection, { minContextSlot, signers: [stakeAccount] });
  //     await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature: signature });
  //   }
  // };

  return <Button onClick={startStake}>TRY</Button>;
};
