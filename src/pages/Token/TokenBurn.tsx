import { useEffect, useState } from "react";
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
import { CustomInput } from "../../components/CustomInput";
import { CustomButton } from "../../components/CustomButton";
import {
  burnToken,
  getLargestAccounts,
} from "../../lib/token";
import { PublicKey, Transaction } from "@solana/web3.js";

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
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [myTokens, setMyTokens] = useState<TokenData[]>([]);
  const [selectedToken, setSelectedToken] = useState<TokenData>();

  const [holders, setHolders] = useState<any>([]);
  const [amountToBeBurn, setAmountToBeBurn] = useState<number>(0);
  const [selectedHolder, setSelectedHolder] = useState<string>("");
  const classes = useStyles();

  const burnTransaction = async () => {
    if (publicKey && selectedToken && selectedHolder) {
      const ix = await burnToken(
        publicKey,
        new PublicKey(selectedToken.hex),
        new PublicKey(selectedHolder),
        amountToBeBurn * Math.pow(10, selectedToken.decimal)
      );

      const {
        context: { slot: minContextSlot },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        value: { blockhash, lastValidBlockHeight },
      } = await connection.getLatestBlockhashAndContext();

      try {

        const burnTransaction = new Transaction();
        burnTransaction.add(ix);

        const burnSignature = await sendTransaction(burnTransaction, connection, {
          minContextSlot,
          signers: [],
        });

        await connection.confirmTransaction({
          blockhash,
          lastValidBlockHeight,
          signature: burnSignature,
        });

      } catch (error) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    const init = async () => {
      if (publicKey) {
        const data = await fetchUserTokens(connection, publicKey);

        setMyTokens(data);
        // console.log(data.filter((dp)=> dp.hex === "BpAC9vBjvhqQAewx5E1RdqZNrNAD2wbTQP7muK5NNpBJ" ));
      }
    };
    init();
  }, [connection, publicKey]);

  useEffect(() => {
    const fetch = async () => {
      if (selectedToken) {
        const getLargest = await getLargestAccounts(
          connection,
          new PublicKey(selectedToken.hex)
        );
        // setActionLoader(false);
        console.log(getLargest.value[0].address.toBase58());
        setHolders(getLargest.value);
      }
    };

    fetch();
  }, [connection, selectedToken]);

  console.log(holders);

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
              <InputLabel id="selectLabel">Select a Token</InputLabel>
              <Select
                value={selectedToken?.hex || ""}
                label="CEP-48 Token"
                onChange={(e: any) => {
                  const token = myTokens.find(
                    (tkn: any) => tkn.hex === e.target.value
                  );
                  if (token != undefined) {
                    setSelectedToken(token);
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
          {selectedToken && (
            <Grid item display={"flex"} justifyContent={"center"}>
              <FormControl fullWidth>
                <InputLabel id="selectLabel">Select a Holder</InputLabel>
                <Select
                  value={selectedHolder}
                  label="CEP-48 Token"
                  onChange={(e: any) => {
                    setSelectedHolder(e.target.value);
                  }}
                  className={classes.input}
                  id={"custom-select"}
                >
                  {holders.map((holder: any) => {
                    return (
                      <MenuItem
                        key={holder.address.toBase58()}
                        value={holder.address.toBase58()}
                      >
                        {holder.address.toBase58()}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>
          )}

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
                disable={false}
                value={amountToBeBurn}
              ></CustomInput>
            </Grid>
            <Grid item paddingX={"0.25rem"}>
              <Typography
                marginTop={"0.25rem"}
                variant="caption"
                display={"flex"}
                justifyContent={"start"}
              >
                Burnable token amount:
              </Typography>
            </Grid>
          </Grid>
          <Grid item display={"flex"} justifyContent={"center"}>
            <CustomButton
              label="Burn Token"
              disable={amountToBeBurn <= 0}
              onClick={() => {
                if (publicKey) {
                  burnTransaction();
                } else {
                  console.log("olmadi");
                }
              }}
            ></CustomButton>
          </Grid>
        </Stack>
      </Grid>
    </Grid>
  );
};
