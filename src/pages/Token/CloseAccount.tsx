/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { CircularProgress, Divider, FormControl, Grid, InputLabel, MenuItem, Select, Stack, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { accountState, fetchUserTokens } from "../../lib";
import { TokenData } from "../../utils/types";
import { CustomButton } from "../../components/CustomButton";
import { closeAccount, getLargestAccounts } from "../../lib/token";
import { PublicKey, Transaction } from "@solana/web3.js";
import { ACCOUNT_STATE } from "../../utils/enum";
import toastr from "toastr";
import { useNavigate } from "react-router-dom";
import { CustomInput } from "../../components/CustomInput";

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

export const CloseAccount = () => {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [myTokens, setMyTokens] = useState<TokenData[]>([]);
  const [selectedToken, setSelectedToken] = useState<TokenData>();
  const [holders, setHolders] = useState<any>([]);
  const [selectedHolder, setSelectedHolder] = useState<string>("");
  const [destinationPubkey, setDestinationPubkey] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const classes = useStyles();
  const navigate = useNavigate();
  const [myAddresses, setMyAddresses] = useState<any[]>([]);

  const closeTransaction = async () => {
    if (publicKey && selectedToken && selectedHolder) {
      setLoading(true);
      const ix = await closeAccount(new PublicKey(selectedHolder), new PublicKey(destinationPubkey), publicKey);

      const {
        context: { slot: minContextSlot },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        value: { blockhash, lastValidBlockHeight },
      } = await connection.getLatestBlockhashAndContext();

      try {
        const closeTransaction = new Transaction();
        closeTransaction.add(ix);

        const closeSignature = await sendTransaction(closeTransaction, connection, {
          minContextSlot,
          signers: [],
        });

        await connection.confirmTransaction({
          blockhash,
          lastValidBlockHeight,
          signature: closeSignature,
        });

        toastr.success("Close account created Successfully");
        navigate("/my-tokens");
      } catch (error: any) {
        toastr.error(error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const init = async () => {
      if (publicKey) {
        const data = await fetchUserTokens(connection, publicKey);

        setMyTokens(data);
        setLoading(false);
        // console.log(data.filter((dp)=> dp.hex === "BpAC9vBjvhqQAewx5E1RdqZNrNAD2wbTQP7muK5NNpBJ" ));
      }
    };
    init();
  }, [connection, publicKey]);

  useEffect(() => {
    const fetch = async () => {
      if (selectedToken) {
        const getLargest = await getLargestAccounts(connection, new PublicKey(selectedToken.hex));
        // setActionLoader(false);
        const activeAccounts = getLargest.value.map((gt) => accountState(connection, gt.address));
        const activeStatus = await Promise.all(activeAccounts);
        const filteredData = getLargest.value.filter((gl, index) => {
          if (activeStatus[index]?.toString() == ACCOUNT_STATE.FROZEN) {
            return gl;
          }
        });
        setHolders(filteredData);
      }
    };

    fetch();
  }, [connection, selectedToken]);

  useEffect(() => {
    const fetch = async () => {
      if (selectedToken && publicKey) {
        const getLargest = await getLargestAccounts(connection, new PublicKey(selectedToken.hex));
        const myAddress = await connection.getTokenAccountsByOwner(publicKey, {
          mint: new PublicKey(selectedToken.hex),
        });
        const myAddressPubkeys = myAddress.value.map((my) => my.pubkey.toBase58());

        setMyAddresses(myAddressPubkeys);
        setHolders(getLargest.value);
      }
    };

    fetch();
  }, [connection, publicKey, selectedToken]);

  if (loading) {
    return (
      <div
        style={{
          height: "4rem",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </div>
    );
  }

  return (
    <Grid container className={classes.container} direction={"column"}>
      <Grid item className={classes.title}>
        <Typography variant="h5">Close Account</Typography>
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
            <>
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
                          {myAddresses.includes(holder.address.toBase58()) && "My Account: "} {holder.address.toBase58()}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item>
                <CustomInput
                  placeHolder="Destination Pubkey"
                  label="Destination Pubkey"
                  id="destinationPubkey"
                  name="destinationPubkey"
                  type="text"
                  value={destinationPubkey}
                  onChange={(e: any) => setDestinationPubkey(e.target.value)}
                  disable={false}
                ></CustomInput>
              </Grid>
            </>
          )}
        </Stack>
      </Grid>
      <Grid item display={"flex"} justifyContent={"center"} marginTop={"2rem"}>
        <CustomButton
          label="close Account"
          disable={selectedHolder === undefined || selectedToken === undefined}
          onClick={() => {
            closeTransaction();
          }}
        ></CustomButton>
      </Grid>
    </Grid>
  );
};
