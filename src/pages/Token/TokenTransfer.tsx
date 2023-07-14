import { useEffect, useState } from "react";
import { createTransferInstruction, getAccount } from "@solana/spl-token";
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
  const [selectedToken, setSelectedToken] = useState<any>();
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const classes = useStyles();

  useEffect(() => {
    const init = async () => {
      if (publicKey) {
        const tokenData = await fetchUserTokens(connection, publicKey);
        console.log(tokenData);
        setTokens(tokenData);

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

      const { associatedToken } = getOrCreateAssociatedTokenAccount(selectedTokenPubkey, publicKey, publicKey);
      const { associatedToken: toAssociatedToken, transaction: tx2 } = getOrCreateAssociatedTokenAccount(selectedTokenPubkey, publicKey, destination);

      const signature2 = await sendTransaction(tx2, connection, { minContextSlot });
      await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature: signature2 });

      const account = await getAccount(connection, associatedToken);

      const toAccount = await getAccount(connection, toAssociatedToken);

      const transaction = new Transaction().add(
        createTransferInstruction(account.address, toAccount.address, publicKey, amount * Math.pow(10, selectedToken.supply.value.decimals))
      );

      const signature = await sendTransaction(transaction, connection, { minContextSlot });
      await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature });
    }
  };
  console.log(selectedToken);
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
            value={selectedToken ? selectedToken.hex : "default"}
            label="ERC-20 Token"
            onChange={(event: SelectChangeEvent) => {
              const selectedData = tokens.find((tk: any) => tk.hex === event.target.value);
              setSelectedToken(selectedData);
            }}
            style={{ maxWidth: "18rem", marginBottom: "1rem", width: "100%" }}
            id={"custom-select"}
          >
            <MenuItem value="default">
              <em>Select a Token</em>
            </MenuItem>
            {tokens.map((tk: any) => {
              return (
                <MenuItem key={tk.hex} value={tk.hex}>
                  {tk.metadata.name + "(" + tk.metadata.symbol + ")"}
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
          <CustomButton label="Send Token" disable={amount <= 0 || destinationPubkey === "" || selectedToken === ""} onClick={transfer}></CustomButton>
        </Grid>
      </Grid>
    </div>
  );
};
