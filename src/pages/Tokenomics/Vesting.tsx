/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import { fetchUserTokens } from "../../lib";
import { TokenData } from "../../utils/types";
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Divider, FormControl, Grid, InputLabel, MenuItem, Select, SelectChangeEvent, Stack, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { CustomButton } from "../../components/CustomButton";
import { vestMulti } from "../../lib/vesting";
import { SignerWalletAdapter } from "@solana/wallet-adapter-base";
import { getBN } from "@streamflow/stream";
import { Recipient, VestParams } from "../../lib/models/Vesting";
import { getTimestamp } from "../../lib/utils";

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
    if (wallet && selectedToken && receipentPubkey) {
      // vestSingle(wallet as SignerWalletAdapter, selectedToken, receipentPubkey, 100, 10, 10);

      const recipients: Recipient[] = [
        {
          recipient: "9U3AaVHiVhncxnQQGRabQCb1wy7SYJStWbLJXhYXPJ1f", // Recipient address (base58 string for Solana)
          amount: getBN(50, selectedToken.decimal), // Deposited amount of tokens (using smallest denomination).
          name: "Receipent1", // The stream name or subject.
          cliffAmount: getBN(10, selectedToken.decimal), // Amount (smallest denomination) unlocked at the "cliff" timestamp.
          amountPerPeriod: getBN(1, selectedToken.decimal), // Release rate: how many tokens are unlocked per each period.
        },
        {
          recipient: "BodqLnSPXrArdj3sKWF3hULSpiuABrcdwhtWw8om1JdQ", // Recipient address (base58 string for Solana)
          amount: getBN(20, selectedToken.decimal), // Deposited amount of tokens (using smallest denomination).
          name: "Receipent2", // The stream name or subject.
          cliffAmount: getBN(5, selectedToken.decimal), // Amount (smallest denomination) unlocked at the "cliff" timestamp.
          amountPerPeriod: getBN(1, selectedToken.decimal), // Release rate: how many tokens are unlocked per each period.
        },
        // ... Other Recipient options
      ];

      const params: VestParams = {
        startDate: getTimestamp() + 60,
        cliff: getTimestamp() + 120,
        period: 1,
      };

      vestMulti(wallet as SignerWalletAdapter, selectedToken, params, recipients);
    }
  };

  // const withdrawToken = async () => {
  //   if (wallet) {
  //     const data = await getStreamById("4pGNY8WcgcrsCwniFe1bbnFwhRKKj1ECaY4fSrJf84zB");

  //     console.log(data);

  //     withdraw(wallet as any, "4pGNY8WcgcrsCwniFe1bbnFwhRKKj1ECaY4fSrJf84zB", 100, 9);
  //     // unlock("2cf8zjHfUR68qUVPWWWdf3E34udtH9tDpm4L9vf2FJGx");
  //   }
  // };

  // useEffect(() => {
  //   const init = async () => {
  //     if (publicKey) {
  //       const data = await getVestingMyOwn(publicKey.toBase58());
  //       console.log(data);
  //     }
  //   };

  //   init();
  // }, [publicKey]);

  return (
    <Grid container className={classes.container} direction={"column"}>
      <Grid item className={classes.title}>
        <Typography variant="h5">Vesting</Typography>
        <Divider sx={{ marginTop: "1rem", background: "white" }} />
      </Grid>
      <Grid item marginTop={"1.2rem"}>
        <Stack direction={"column"} width={"100%"} spacing={4}>
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
          <FormControl fullWidth>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker label="Basic date time picker" />
            </LocalizationProvider>
          </FormControl>
        </Stack>
      </Grid>
      <Grid item marginTop={2} display={"flex"} justifyContent={"center"} alignItems={"center"} flexDirection={"column"}>
        <CustomButton label="Start Vesting" disable={false} onClick={startVesting} />
      </Grid>
    </Grid>
  );
};
