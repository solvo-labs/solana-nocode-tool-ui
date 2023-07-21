import { useEffect, useState } from "react";
import { Divider, FormControl, Grid, InputLabel, MenuItem, Select, Stack, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { accountState, fetchUserTokens } from "../../lib";
import { TokenData } from "../../utils/types";
import { CustomButton } from "../../components/CustomButton";
import { freezeAccount, getLargestAccounts } from "../../lib/token";
import { PublicKey, Transaction } from "@solana/web3.js";
import { ACCOUNT_STATE } from "../../utils/enum";
import toastr from "toastr";
import { useNavigate } from "react-router-dom";

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

export const FreezeAccount = () => {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [myTokens, setMyTokens] = useState<TokenData[]>([]);
  const [selectedToken, setSelectedToken] = useState<TokenData>();
  const [holders, setHolders] = useState<any>([]);
  const [selectedHolder, setSelectedHolder] = useState<string>("");
  const classes = useStyles();
  const navigate = useNavigate();

  const freezeTransaction = async () => {
    if (publicKey && selectedToken && selectedHolder) {
      const ix = await freezeAccount(new PublicKey(selectedHolder), new PublicKey(selectedToken.hex), publicKey);

      const {
        context: { slot: minContextSlot },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        value: { blockhash, lastValidBlockHeight },
      } = await connection.getLatestBlockhashAndContext();

      try {
        const freezeTransaction = new Transaction();
        freezeTransaction.add(ix);

        const freezeSignature = await sendTransaction(freezeTransaction, connection, {
          minContextSlot,
          signers: [],
        });

        await connection.confirmTransaction({
          blockhash,
          lastValidBlockHeight,
          signature: freezeSignature,
        });

        toastr.success("Freeze account completed successfully.");
        navigate("/my-tokens");
      } catch (error: any) {
        toastr.error(error);
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
        const getLargest = await getLargestAccounts(connection, new PublicKey(selectedToken.hex));
        const activeStatus = getLargest.value.map((gt) => accountState(connection, gt.address));
        const activeAccounts = await Promise.all(activeStatus);
        const filteredData = getLargest.value.filter((gl, index) => {
          if (activeAccounts[index]?.toString() != ACCOUNT_STATE.FROZEN) {
            return gl;
          }
        });
        setHolders(filteredData);
      }
    };

    fetch();
  }, [connection, selectedToken]);

  return (
    <Grid container className={classes.container} direction={"column"}>
      <Grid item className={classes.title}>
        <Typography variant="h5">Freeze Account</Typography>
        <Divider sx={{ marginTop: "1rem", background: "white" }} />
      </Grid>
      <Grid item marginTop={"2rem"}>
        <Stack direction={"column"} width={"100%"} spacing={4}>
          <Grid item display={"flex"} justifyContent={"center"}>
            <FormControl fullWidth>
              <InputLabel id="selectLabel">Select a Token</InputLabel>
              <Select
                value={selectedToken?.hex || ""}
                label="Token"
                onChange={(e: any) => {
                  const token = myTokens.find((tkn: any) => tkn.hex === e.target.value);
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
                  label="Holders"
                  onChange={(e: any) => {
                    setSelectedHolder(e.target.value);
                  }}
                  className={classes.input}
                  id={"custom-select"}
                >
                  {holders.map((holder: any) => {
                    return (
                      <MenuItem key={holder.address.toBase58()} value={holder.address.toBase58()}>
                        {holder.address.toBase58() + " "}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>
          )}
        </Stack>
      </Grid>
      <Grid item display={"flex"} justifyContent={"center"} marginTop={"2rem"}>
        <CustomButton
          label="Freeze Account"
          disable={selectedHolder === undefined || selectedToken === undefined}
          onClick={() => {
            freezeTransaction();
          }}
        ></CustomButton>
      </Grid>
    </Grid>
  );
};
