import React, { useEffect, useState } from "react";
import { TOKEN_PROGRAM_ID, createTransferInstruction, getAccount } from "@solana/spl-token";
import { PublicKey, Transaction } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Grid, Typography, Divider, Stack, Theme, CircularProgress, Select, MenuItem, SelectChangeEvent } from "@mui/material";
import { CustomButton } from "../../components/CustomButton";
import { CustomInput } from "../../components/CustomInput";
import { makeStyles } from "@mui/styles";
import { fetchUserTokens } from "../../lib";
import { getOrCreateAssociatedTokenAccount } from "../../lib/token";

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    textAlign: "center",
    minWidth: "25rem",
    [theme.breakpoints.down("sm")]: {
      minWidth: "10rem",
    },
  },
}));

export const TokenTransfer = () => {
  const [destinationPubkey, setDestinationPubkey] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);
  const [tokens, setTokens] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedToken, setSelectedToken] = useState<string>("");
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const classes = useStyles();

  useEffect(() => {
    const init = async () => {
      if (publicKey) {
        const tokenData = await fetchUserTokens(connection, publicKey);

        const filteredData = tokenData.filter((dt) => dt.metadata);

        setTokens(filteredData);

        setLoading(false);
      }
    };

    init();
  }, [connection, publicKey]);

  const transfer = async () => {
    if (publicKey) {
      const {
        context: { slot: minContextSlot },
        value: { blockhash, lastValidBlockHeight },
      } = await connection.getLatestBlockhashAndContext();

      const destination = new PublicKey(destinationPubkey);
      const selectedTokenPubkey = new PublicKey(selectedToken);

      const { associatedToken } = getOrCreateAssociatedTokenAccount(selectedTokenPubkey, publicKey);
      const account = await getAccount(connection, associatedToken, undefined, TOKEN_PROGRAM_ID);

      const transaction = new Transaction().add(createTransferInstruction(account.address, destination, publicKey, 500000));

      const signature = await sendTransaction(transaction, connection, { minContextSlot });
      await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature });
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
        <Grid item marginBottom={"2rem"}>
          <Typography variant="h5" marginTop="3rem">
            Token Transfer
          </Typography>
          <Divider sx={{ marginTop: "1rem", background: "white" }} />
        </Grid>
        <Grid item justifyContent={"center"} marginBottom={"2rem"}>
          <Select
            value={selectedToken || "default"}
            label="ERC-20 Token"
            onChange={(event: SelectChangeEvent) => {
              setSelectedToken(event.target.value);
            }}
            id={"custom-select"}
          >
            <MenuItem value="default">
              <em>Select a Token</em>
            </MenuItem>
            {tokens.map((tk: any) => {
              return (
                <MenuItem key={tk.hex} value={tk.hex}>
                  {tk.metadata.data.name + "(" + tk.metadata.data.symbol + ")"}
                </MenuItem>
              );
            })}
          </Select>
          <Stack direction={"column"} spacing={2} alignItems={"center"}>
            <CustomInput
              placeHolder="Destination Pubkey"
              label="Destination Pubkey"
              id="destinationPubkey"
              name="destinationPubkey"
              type="text"
              value={destinationPubkey}
              onChange={(e: any) => setDestinationPubkey(e.target.value)}
            ></CustomInput>

            <CustomInput placeHolder="Amount" label="Amount" id="amount" name="amount" type="text" value={amount} onChange={(e: any) => setAmount(e.target.value)}></CustomInput>
          </Stack>
        </Grid>
        <Grid item>
          <CustomButton label="Send Token" disable={amount <= 0 || destinationPubkey === ""} onClick={transfer}></CustomButton>
        </Grid>
      </Grid>
    </div>
  );
};
