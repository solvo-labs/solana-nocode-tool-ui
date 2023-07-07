import React, { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { createMint, getOrCreateAssociatedTokenAccount } from "../../lib/token";
import { Transaction } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, createMintToInstruction, getAccount } from "@solana/spl-token";
import { register } from "../../lib/tokenRegister";
import { Token } from "../../utils/types";
import { CustomInput } from "../../components/CustomInput";
import { makeStyles } from "@mui/styles";
import { Divider, Grid, Stack, Theme, Typography } from "@mui/material";
import { CustomButton } from "../../components/CustomButton";

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    textAlign: "center",
    minWidth: "25rem",
    [theme.breakpoints.down("sm")]: {
      minWidth: "10rem",
    },
  },
}));

const TokenMint: React.FC = () => {
  const classes = useStyles();
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const [tokenData, setTokenData] = useState<Token>({
    name: "",
    symbol: "",
    amount: 0,
    decimal: 8,
  });

  const createTransaction = async () => {
    if (publicKey) {
      const { transaction, toAccount } = await createMint(connection, publicKey, tokenData.decimal);

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

        // supply
        const transaction3 = new Transaction().add(createMintToInstruction(toAccount.publicKey, account.address, publicKey, tokenData.amount, [], TOKEN_PROGRAM_ID));
        const signature3 = await sendTransaction(transaction3, connection, { minContextSlot });
        await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature: signature3 });

        const transaction4 = register(toAccount.publicKey.toBase58(), publicKey, { name: tokenData.name, symbol: tokenData.symbol });
        const signature4 = await sendTransaction(transaction4, connection, { minContextSlot });
        await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature: signature4 });
      } catch (error) {
        console.log(error);
      }
    }
  };

  const disable = !(
    tokenData.name &&
    tokenData.symbol &&
    tokenData.amount &&
    tokenData.decimal
  );

  return (
    <div>
      <Grid container className={classes.container} direction={"column"}>
        <Grid item marginBottom={"2rem"}>
          <Typography variant="h5">Token Mint</Typography>
          <Divider sx={{ marginTop: "1rem", background: "white" }} />
        </Grid>
        <Grid item justifyContent={"center"} marginBottom={"2rem"}>
          <Stack direction={"column"} spacing={2} alignItems={"center"}>
            <CustomInput
              placeHolder="Name"
              label="Name"
              id="name"
              name="name"
              type="text"
              value={tokenData.name}
              onChange={(e: any) =>
                setTokenData({ ...tokenData, name: e.target.value })
              }
            ></CustomInput>
            <CustomInput
              placeHolder="Symbol"
              label="Symbol"
              id="symbol"
              name="symbol"
              type="text"
              value={tokenData.symbol}
              onChange={(e: any) =>
                setTokenData({ ...tokenData, symbol: e.target.value })
              }
            ></CustomInput>
            <CustomInput
              placeHolder="Amount"
              label="Amount"
              id="amount"
              name="amount"
              type="text"
              value={tokenData.amount}
              onChange={(e: any) =>
                setTokenData({ ...tokenData, amount: e.target.value })
              }
            ></CustomInput>
            <CustomInput
              placeHolder="Decimal"
              label="Decimal"
              id="decimal"
              name="decimal"
              type="text"
              value={tokenData.decimal}
              onChange={(e: any) =>
                setTokenData({ ...tokenData, decimal: e.target.value })
              }
            ></CustomInput>
          </Stack>
        </Grid>
        <Grid item>
          <CustomButton
            label="create token"
            disable={disable}
            onClick={createTransaction}
          ></CustomButton>
        </Grid>
      </Grid>
    </div>
  );
};

export default TokenMint;
