/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { CircularProgress, Divider, FormControl, Grid, InputLabel, MenuItem, Select, Stack, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { fetchUserTokens } from "../../lib";
import { TokenData } from "../../utils/types";
import { CustomInput } from "../../components/CustomInput";
import { CustomButton } from "../../components/CustomButton";
import { burnToken, getLargestAccounts } from "../../lib/token";
import { PublicKey, Transaction } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, createMintToInstruction } from "@solana/spl-token";
import { useNavigate } from "react-router-dom";
import toastr from "toastr";

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

export const TokenMintAndBurn = () => {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [myTokens, setMyTokens] = useState<TokenData[]>([]);
  const [selectedToken, setSelectedToken] = useState<TokenData>();
  const [loading, setLoading] = useState<boolean>(true);


  const [holders, setHolders] = useState<any>([]);
  const [amountToBeBurn, setAmountToBeBurn] = useState<number>(0);
  const [selectedHolder, setSelectedHolder] = useState<any>();
  const [myAddresses, setMyAddresses] = useState<any[]>([]);
  const classes = useStyles();
  const navigate = useNavigate();

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

  const mintTransaction = async () => {
    if (publicKey && selectedToken && selectedHolder) {
      const ix = new Transaction().add(
        createMintToInstruction(new PublicKey(selectedToken.hex), selectedHolder.address, publicKey, amountToBeBurn * Math.pow(10, selectedToken.decimal), [], TOKEN_PROGRAM_ID)
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

        toastr.success("Mint completed Successfully");
        navigate("/my-tokens");
      } catch (error) {
        console.log(error);
      }
    }
  };

  const burnTransaction = async () => {
    if (publicKey && selectedToken && selectedHolder) {
      const ix = await burnToken(publicKey, new PublicKey(selectedToken.hex), selectedHolder.address, amountToBeBurn * Math.pow(10, selectedToken.decimal));

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

        toastr.success("Burn completed Successfully");
        navigate("/my-tokens");
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
        setLoading(false);
        // console.log(data.filter((dp)=> dp.hex === "BpAC9vBjvhqQAewx5E1RdqZNrNAD2wbTQP7muK5NNpBJ" ));
      }
    };
    init();
  }, [connection, publicKey]);

  if (  loading) {
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
        <Typography variant="h5">Mint & Burn token</Typography>
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
                  value={selectedHolder ? selectedHolder.address.toBase58() : ""}
                  label=" Token"
                  onChange={(e: any) => {
                    const currentHolder = holders.find((hf: any) => hf.address.toBase58() === e.target.value);
                    setSelectedHolder(currentHolder);
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
          )}

          <Grid container display={"flex"} justifyContent={"center"} direction={"column"}>
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
            {selectedHolder && (
              <Grid item paddingX={"0.25rem"}>
                <Typography marginTop={"0.25rem"} variant="caption" display={"flex"} justifyContent={"start"}>
                  Token amount : {selectedHolder.uiAmount}
                </Typography>
              </Grid>
            )}
          </Grid>
          <Grid item gap={2} display={"flex"} justifyContent={"center"} alignItems={"center"} flexDirection={"column"}>
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

            <CustomButton
              label="Mint Token"
              disable={amountToBeBurn <= 0}
              onClick={() => {
                if (publicKey) {
                  mintTransaction();
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
