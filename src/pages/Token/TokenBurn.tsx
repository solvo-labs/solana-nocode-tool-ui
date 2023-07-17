import React, { useEffect, useState } from "react";
import {
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

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    minWidth: "25rem",
    [theme.breakpoints.down("sm")]: {
      minWidth: "10rem",
    },
  },
  title: {
    textAlign: "center",
  },
  select: {
    width: "100%",
    // maxHeight: "44px !important",
    [theme.breakpoints.up("sm")]: {
      maxWidth: "18rem !important",
    },
    [theme.breakpoints.down("sm")]: {
      maxWidth: "20rem !important",
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

  const [bok, setbok] = useState("");

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

  return (
    <Grid container className={classes.container} direction={"column"}>
      <Grid item className={classes.title}>
        <Typography variant="h5">Burn token</Typography>
        <Divider sx={{ marginTop: "1rem", background: "white" }} />
      </Grid>
      <Grid item justifyContent={"center"} marginTop={"2rem"}>
        <Stack
          direction={"column"}
          spacing={2}
          alignItems={"center"}
          justifyContent={"center"}
        >
          <FormControl className={classes.select}>
            <InputLabel id="demo-simple-select-label">
              Select an CEP-48 Token
            </InputLabel>
            <Select
              value={bok}
              //   label="ERC-20 Token"
              onChange={(e: any) => {
                // console.log(e.target.value);
                setbok(e.target.value);

                const buldum = myTokens.find(
                  (ara: any) => ara.hex === e.target.value
                );
                console.log(buldum?.hex);
                if (buldum != undefined) {
                  setSelectedToken({
                    ...selectedToken,
                    hex: buldum.hex,
                    amount: buldum.amount,
                    metadata: {
                      ...selectedToken.metadata,
                      name: buldum.metadata.name,
                      symbol: buldum.metadata.symbol,
                    },
                  });
                }

                // const neeeyy = myTokens.find(
                //   (e: any) => e.hex == event.target.value
                // );
                // console.log(neeeyy);
                // setSelectedToken({
                //   ...selectedToken,
                //   hex: myTokens[e.target.value].hex,
                //   metadata: {
                //     ...selectedToken.metadata,
                //     name: myTokens[e.target.value].metadata.name,
                //   },
                // });
              }}
              style={{ maxWidth: "18rem", marginBottom: "1rem", width: "100%" }}
              id={"custom-select"}
            >
              {myTokens.map((tk: any, index: number) => {
                return (
                  <MenuItem key={tk.hex} value={tk.hex}>
                    {tk.metadata.name + "(" + tk.metadata.symbol + ")"}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Stack>
      </Grid>
    </Grid>
  );
};
