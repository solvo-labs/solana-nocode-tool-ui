import React, { useEffect, useState } from "react";
import {
  Box,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Theme,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { fetchUserTokens } from "../../lib";
import { TokenData } from "../../utils/types";
import { CustomInput } from "../../components/CustomInput";
import { CustomButton } from "../../components/CustomButton";

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

export const TokenBurn = () => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [myTokens, setMyTokens] = useState<TokenData[]>([]);
  const [selectedToken, setSelectedToken] = useState<TokenData>({
    hex: "",
    amount: 0,
    metadata: {
      name: "",
      symbol: "",
    },
  });
  const [amountToBeBurn, setAmountToBeBurn] = useState<number>(0);

  const classes = useStyles();

  useEffect(() => {
    const init = async () => {
      if (publicKey) {
        const data = await fetchUserTokens(connection, publicKey);

        setMyTokens(data);
        // setActionLoader(false);
      }
    };
    init();
  }, [connection, publicKey]);

  console.log(selectedToken);
  let lastValue: number = amountToBeBurn;
  const valueControl = (): number => {
    if (amountToBeBurn > selectedToken.amount) {
      lastValue = selectedToken.amount;
    }
    if (amountToBeBurn < 0) {
      lastValue = 0;
    }
    return lastValue;
  };
  console.log(valueControl());

  const disable = !selectedToken.amount;

  return (
    <Grid container className={classes.container} direction={"column"}>
      <Grid item className={classes.title}>
        <Typography variant="h5">Burn token</Typography>
        <Divider sx={{ marginTop: "1rem", background: "white" }} />
      </Grid>
      <Grid item marginTop={"2rem"}>
        <Stack direction={"column"} width={"100%"} spacing={4}>
          <Grid item display={"flex"} justifyContent={"center"}>
            <FormControl fullWidth>
              <InputLabel id="selectLabel">Select an CEP-48 Token</InputLabel>
              <Select
                value={selectedToken.hex}
                label="CEP-48 Token"
                onChange={(e: any) => {
                  const token = myTokens.find(
                    (tkn: any) => tkn.hex === e.target.value
                  );
                  if (token != undefined) {
                    setSelectedToken({
                      ...selectedToken,
                      hex: token.hex,
                      amount: token.amount,
                      metadata: {
                        ...selectedToken.metadata,
                        name: token.metadata.name,
                        symbol: token.metadata.symbol,
                      },
                    });
                  }
                }}
                className={classes.input}
                id={"custom-select"}
              >
                {myTokens.map((tk: any) => {
                  return (
                    <MenuItem key={tk.hex} value={tk.hex}>
                      {tk.metadata.name + "(" + tk.metadata.symbol + ")"}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Grid>
          <Grid
            container
            display={"flex"}
            justifyContent={"center"}
            direction={"column"}
          >
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
                disable={disable}
                value={valueControl()}
              ></CustomInput>
            </Grid>
            <Grid item paddingX={"0.25rem"}>
              <Typography
                marginTop={"0.25rem"}
                variant="caption"
                display={"flex"}
                justifyContent={"start"}
              >
                Burnable token amount: {selectedToken.amount}
              </Typography>
            </Grid>
          </Grid>
          <Grid item display={"flex"} justifyContent={"center"}>
            <CustomButton
              label="Burn Token"
              disable={disable}
              onClick={() => {
                console.log(amountToBeBurn);
              }}
            ></CustomButton>
          </Grid>
        </Stack>
      </Grid>
    </Grid>
  );
};
