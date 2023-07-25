/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import { fetchUserTokens } from "../../lib";
import { TokenData } from "../../utils/types";
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Divider, FormControl, Grid, InputLabel, MenuItem, Select, SelectChangeEvent, Stack, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { CustomButton } from "../../components/CustomButton";
import { vestMultiTest, vestTest } from "../../lib/vesting";
import { getOrCreateAssociatedTokenAccount } from "../../lib/token";
import { PublicKey } from "@solana/web3.js";
import { getAccount } from "@solana/spl-token";

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    minWidth: "30vw",
    [theme.breakpoints.down("sm")]: {
      minWidth: "80vw",
    },
  },
  title: {
    textAlign: "center",
  },
  subTitle: {
    textAlign: "start",
  },
  input: {
    width: "100%",
    // maxHeight: "44px !important",
    [theme.breakpoints.up("sm")]: {
      // minWidth: "18rem !important",
    },
    [theme.breakpoints.down("sm")]: {
      // minWidth: "12rem !important",
    },
  },
}));

export const Vesting = () => {
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const { publicKey, sendTransaction } = useWallet();
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const [receipentPubkey, setReceipentPubkey] = useState<string>("9U3AaVHiVhncxnQQGRabQCb1wy7SYJStWbLJXhYXPJ1f");
  const [selectedToken, setSelectedToken] = useState<TokenData>();
  const classes = useStyles();

  useEffect(() => {
    const init = async () => {
      if (publicKey) {
        const data = await fetchUserTokens(connection, publicKey);

        setTokens(data);
        // console.log(data.filter((dp)=> dp.hex === "BpAC9vBjvhqQAewx5E1RdqZNrNAD2wbTQP7muK5NNpBJ" ));
      }
    };
    init();
  }, [connection, publicKey]);

  const startVesting = async () => {
    if (wallet && selectedToken && publicKey) {
      const { account, transaction, associatedToken } = await getOrCreateAssociatedTokenAccount(
        new PublicKey(selectedToken.hex),
        publicKey,
        new PublicKey(receipentPubkey),
        connection
      );

      if (account) {
        vestTest(wallet, selectedToken.hex, account.address.toBase58());
      } else {
        const {
          context: { slot: minContextSlot },
          value: { blockhash, lastValidBlockHeight },
        } = await connection.getLatestBlockhashAndContext();

        const signature = await sendTransaction(transaction, connection, {
          minContextSlot,
        });

        await connection.confirmTransaction({
          blockhash,
          lastValidBlockHeight,
          signature: signature,
        });

        const newAccount = await getAccount(connection, associatedToken);

        vestTest(wallet, selectedToken.hex, newAccount.address.toBase58());

        // vestMultiTest(wallet, selectedToken.hex, [newAccount.address.toBase58()]);
      }
    }
  };

  return (
    <Grid container className={classes.container} direction={"column"}>
      <Grid item className={classes.title}>
        <Typography variant="h5">Vesting</Typography>
        <Divider sx={{ marginTop: "1rem", background: "white" }} />
      </Grid>
      <Grid item marginTop={"2rem"}>
        <Stack direction={"column"} width={"100%"} spacing={4}>
          <Grid item display={"flex"} justifyContent={"center"}>
            <FormControl fullWidth>
              <InputLabel id="selectLabel">Select a Token</InputLabel>
              <Select
                value={selectedToken?.hex || ""}
                label=" Token"
                onChange={(e: SelectChangeEvent<string>) => {
                  const token = tokens.find((tkn: TokenData) => tkn.hex === e.target.value);
                  if (token != undefined) {
                    setSelectedToken(token);
                  }
                }}
                className={classes.input}
                id={"custom-select"}
              >
                {tokens.map((tk: TokenData) => {
                  return (
                    <MenuItem key={tk.hex} value={tk.hex}>
                      {tk.metadata.name + "(" + tk.metadata.symbol + ")"}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Grid>

          {/* <Grid container display={"flex"} justifyContent={"center"} direction={"column"}>
            <Grid item display={"flex"} justifyContent={"center"}>
              <CustomInput
                id=""
                label="Amount"
                name="amount"
                onChange={(e: any) => {
                  setAmountToBeBurn(e.target.value);
                }}
                placeHolder="Amount"
                type="number"
                disable={false}
                value={amountToBeBurn}
              ></CustomInput>
            </Grid> */}

          <Grid item gap={2} display={"flex"} justifyContent={"center"} alignItems={"center"} flexDirection={"column"}>
            <CustomButton label="Start Vesting" disable={false} onClick={startVesting} />
          </Grid>
        </Stack>
      </Grid>
    </Grid>
  );
};
