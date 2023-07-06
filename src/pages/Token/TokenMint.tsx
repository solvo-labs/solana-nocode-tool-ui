import React from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { createMint, getOrCreateAssociatedTokenAccount } from "../../lib/token";
import { Transaction } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, createMintToInstruction, getAccount } from "@solana/spl-token";

const TokenMint: React.FC = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const createTransaction = async () => {
    if (publicKey) {
      const { transaction, toAccount } = await createMint(connection, publicKey);

      const {
        context: { slot: minContextSlot },
        value: { blockhash, lastValidBlockHeight },
      } = await connection.getLatestBlockhashAndContext();

      try {
        const signature = await sendTransaction(transaction, connection, { minContextSlot, signers: [toAccount] });
        await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature });

        const { transaction: transaction2, associatedToken } = getOrCreateAssociatedTokenAccount(toAccount.publicKey, publicKey);
        const signature2 = await sendTransaction(transaction2, connection, { minContextSlot });
        await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature: signature2 });

        const account = await getAccount(connection, associatedToken, undefined, TOKEN_PROGRAM_ID);

        const transaction3 = new Transaction().add(createMintToInstruction(toAccount.publicKey, account.address, publicKey, 100000000000, [], TOKEN_PROGRAM_ID));
        const signature3 = await sendTransaction(transaction3, connection, { minContextSlot });
        await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature: signature3 });
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <div>
      <h1>TokenMint</h1>
      <button onClick={createTransaction}></button>
    </div>
  );
};

export default TokenMint;
