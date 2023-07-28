/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { createTransferInstruction, getAccount } from "@solana/spl-token";
import { PublicKey, Transaction } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Grid, Typography, Divider, Stack, Theme, CircularProgress, Select, MenuItem, SelectChangeEvent, InputLabel, FormControl } from "@mui/material";
import { CustomButton } from "../../components/CustomButton";
import { CustomInput } from "../../components/CustomInput";
import { makeStyles } from "@mui/styles";
import { fetchUserTokens } from "../../lib";
import { getOrCreateAssociatedTokenAccount } from "../../lib/token";
import { TokenData } from "../../utils/types";
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
  select: {
    width: "100%",
  },
}));

export const TokenTransfer = () => {
  const [destinationPubkey, setDestinationPubkey] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);
  const [tokens, setTokens] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedToken, setSelectedToken] = useState<TokenData>();
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const classes = useStyles();
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      if (publicKey) {
        const tokenData = await fetchUserTokens(connection, publicKey);

        setTokens(tokenData);

        setLoading(false);
      }
    };

    init();
  }, [connection, publicKey]);

  const transfer = async () => {
    try {
      if (publicKey && selectedToken) {
        const {
          context: { slot: minContextSlot },
          value: { blockhash, lastValidBlockHeight },
        } = await connection.getLatestBlockhashAndContext();

        const destination = new PublicKey(destinationPubkey);
        const selectedTokenPubkey = new PublicKey(selectedToken.hex);

        const { associatedToken } = await getOrCreateAssociatedTokenAccount(selectedTokenPubkey, publicKey, publicKey, connection);

        const fromAccount = await getAccount(connection, associatedToken);

        const {
          transaction: tx2,
          account: toAccount,
          associatedToken: associatedTokenTo,
        } = await getOrCreateAssociatedTokenAccount(selectedTokenPubkey, publicKey, destination, connection);

        if (tx2) {
          const signature2 = await sendTransaction(tx2, connection, {
            minContextSlot,
          });
          await connection.confirmTransaction({
            blockhash,
            lastValidBlockHeight,
            signature: signature2,
          });

          const newAccount = await getAccount(connection, associatedTokenTo);

          const transaction = new Transaction().add(createTransferInstruction(fromAccount.address, newAccount.address, publicKey, amount * Math.pow(10, selectedToken.decimal)));

          const signature = await sendTransaction(transaction, connection, {
            minContextSlot,
          });
          await connection.confirmTransaction({
            blockhash,
            lastValidBlockHeight,
            signature,
          });
          toastr.success("Transfer completed successfully.");
          navigate("/my-tokens");
        } else {
          const transaction = new Transaction().add(createTransferInstruction(fromAccount.address, toAccount.address, publicKey, amount * Math.pow(10, selectedToken.decimal)));

          const signature = await sendTransaction(transaction, connection, {
            minContextSlot,
          });
          await connection.confirmTransaction({
            blockhash,
            lastValidBlockHeight,
            signature,
          });
          toastr.success("Transfer completed successfully.");
          navigate("/my-tokens");
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

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
    <div>
      <Grid container className={classes.container} direction={"column"}>
        <Grid item className={classes.title}>
          <Typography variant="h5">Token Transfer</Typography>
          <Divider sx={{ marginTop: "1rem", background: "white" }} />
        </Grid>
        <Grid item marginTop={"2rem"}>
          <Stack direction={"column"} spacing={4} width={"100%"}>
            <Grid container display={"flex"} justifyContent={"center"} direction={"column"}>
              <Grid item display={"flex"} justifyContent={"center"}>
                <FormControl fullWidth>
                  <InputLabel id="selectLabel">Select a Token</InputLabel>
                  <Select
                    value={selectedToken ? selectedToken.hex : "default"}
                    label="ERC-20 Token"
                    variant="outlined"
                    onChange={(event: SelectChangeEvent) => {
                      const selectedData = tokens.find((tk: any) => tk.hex === event.target.value);
                      setSelectedToken(selectedData);
                    }}
                    id={"transferSelect"}
                    className={classes.select}
                  >
                    {tokens.map((tk: any) => {
                      return (
                        <MenuItem key={tk.hex} value={tk.hex}>
                          {tk.metadata.name + "(" + tk.metadata.symbol + ")"}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item>
                <Typography marginTop={"0.25rem"} variant="caption" display={"flex"} justifyContent={"start"}>
                  {selectedToken ? "Balance: " + selectedToken.amount / Math.pow(10, selectedToken.decimal) : "select token"}
                </Typography>
              </Grid>
            </Grid>
            {/* <Grid
              container
              display={"flex"}
              justifyContent={"center"}
              direction={"column"}
            > */}
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

            <Grid item>
              <CustomInput
                placeHolder="Amount"
                label="Amount"
                id="amount"
                name="amount"
                type="text"
                value={amount}
                onChange={(e: any) => setAmount(e.target.value)}
                disable={false}
              ></CustomInput>
            </Grid>
            <Grid item display={"flex"} justifyContent={"center"}>
              <CustomButton
                label="Send Token"
                disable={
                  amount <= 0 || destinationPubkey === ""
                  // selectedToken === ""
                }
                onClick={transfer}
              ></CustomButton>
            </Grid>
            {/* </Grid> */}
          </Stack>
        </Grid>
      </Grid>
    </div>
  );
};
