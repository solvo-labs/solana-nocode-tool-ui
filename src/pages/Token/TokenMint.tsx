/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { createMint, getOrCreateAssociatedTokenAccount } from "../../lib/token";
import { PublicKey, Transaction } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, createMintToInstruction } from "@solana/spl-token";
import { register } from "../../lib/tokenRegister";
import { Token } from "../../utils/types";
import { CustomInput } from "../../components/CustomInput";
import { makeStyles } from "@mui/styles";
import { CircularProgress, Divider, Grid, Stack, Theme, Typography } from "@mui/material";
import { CustomButton } from "../../components/CustomButton";
import { useNavigate } from "react-router-dom";
import toastr from "toastr";
import { NFTStorage } from "nft.storage";
import ImageUpload from "../../components/ImageUpload";

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

const TokenMint: React.FC = () => {
  const classes = useStyles();
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<any>();
  const navigate = useNavigate();

  const [tokenData, setTokenData] = useState<Token>({
    name: "",
    symbol: "",
    amount: 0,
    decimal: 8,
    freezeAuthority: publicKey?.toBase58(),
    authority: publicKey?.toBase58(),
  });

  const storeImage = async () => {
    const storage = new NFTStorage({
      token: import.meta.env.VITE_NFT_STORAGE_API_KEY,
    });

    const fileCid = await storage.storeBlob(new Blob([file]));

    const fileUrl = "https://ipfs.io/ipfs/" + fileCid;

    const obj = {
      image: fileUrl,
    };

    // (5)
    const metadata = new Blob([JSON.stringify(obj)], { type: "application/json" });
    const metadataCid = await storage.storeBlob(metadata);
    const metadataUrl = "https://ipfs.io/ipfs/" + metadataCid;

    return metadataUrl;
  };

  const createTransaction = async () => {
    if (publicKey) {
      setLoading(true);
      const { transaction, toAccount } = await createMint(
        connection,
        publicKey,
        tokenData.freezeAuthority ? new PublicKey(tokenData.freezeAuthority) : publicKey,
        tokenData.decimal
      );

      const {
        context: { slot: minContextSlot },
        value: { blockhash, lastValidBlockHeight },
      } = await connection.getLatestBlockhashAndContext();

      try {
        const { transaction: transaction2, associatedToken } = await getOrCreateAssociatedTokenAccount(toAccount.publicKey, publicKey, publicKey, connection);

        // supply
        const transaction3 = new Transaction().add(
          createMintToInstruction(
            toAccount.publicKey,
            associatedToken,
            tokenData.authority ? new PublicKey(tokenData.authority) : publicKey,
            tokenData.amount * Math.pow(10, tokenData.decimal),
            [],
            TOKEN_PROGRAM_ID
          )
        );

        let uri = "";

        if (file) {
          uri = await storeImage();
        }

        const transaction4 = register(toAccount.publicKey.toBase58(), publicKey, { name: tokenData.name, symbol: tokenData.symbol, uri });

        const finalTransactions = new Transaction();
        finalTransactions.add(transaction);
        finalTransactions.add(transaction2!);
        finalTransactions.add(transaction3);
        finalTransactions.add(transaction4);

        const signature = await sendTransaction(finalTransactions, connection, { minContextSlot, signers: [toAccount] });
        await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature: signature });

        toastr.success("Token Mint completed successfully");
        navigate("/my-tokens");
        setLoading(false);
      } catch (error: any) {
        toastr.error(error);
        setLoading(false);
      }
    }
  };

  const disable = !(tokenData.name && tokenData.symbol && tokenData.amount && tokenData.decimal);

  if (loading) {
    return (
      <div
        style={{
          height: "50vh",
          width: "50vw",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
        }}
      >
        <span style={{ position: "absolute" }}>Token is minting...</span>
        <CircularProgress />
      </div>
    );
  }

  return (
    <div>
      <Grid container className={classes.container} direction={"column"}>
        <Grid item marginBottom={"2rem"}>
          <Typography variant="h5" className={classes.title}>
            Token Mint
          </Typography>
          <Divider sx={{ marginTop: "1rem", background: "white" }} />
        </Grid>
        <Grid item justifyContent={"center"} marginBottom={"2rem"}>
          <Stack direction={"column"} spacing={2} alignItems={"center"}>
            <ImageUpload file={file} setFile={(data) => setFile(data)} />
            <CustomInput
              placeholder="Name"
              label="Name"
              id="name"
              name="name"
              type="text"
              value={tokenData.name}
              onChange={(e: any) => setTokenData({ ...tokenData, name: e.target.value })}
              disable={false}
            ></CustomInput>
            <CustomInput
              placeholder="Symbol"
              label="Symbol"
              id="symbol"
              name="symbol"
              type="text"
              value={tokenData.symbol}
              onChange={(e: any) => setTokenData({ ...tokenData, symbol: e.target.value })}
              disable={false}
            ></CustomInput>
            <CustomInput
              placeholder="Amount"
              label="Amount"
              id="amount"
              name="amount"
              type="text"
              value={tokenData.amount}
              onChange={(e: any) => setTokenData({ ...tokenData, amount: e.target.value })}
              disable={false}
            ></CustomInput>
            <CustomInput
              placeholder="Decimal"
              label="Decimal"
              id="decimal"
              name="decimal"
              type="text"
              value={tokenData.decimal}
              onChange={(e: any) => setTokenData({ ...tokenData, decimal: e.target.value })}
              disable={false}
            />
            <CustomInput
              placeholder="Authority"
              label="Authority"
              id="authority"
              name="authority"
              type="text"
              value={tokenData.authority || ""}
              onChange={(e: any) => setTokenData({ ...tokenData, authority: e.target.value })}
              disable={false}
            />
            <CustomInput
              placeholder="Freeze Authority"
              label="Freeze Authority"
              id="freezeAuthority"
              name="freezeAuthority"
              type="text"
              value={tokenData.freezeAuthority || ""}
              onChange={(e: any) => setTokenData({ ...tokenData, freezeAuthority: e.target.value })}
              disable={false}
            />
          </Stack>
        </Grid>
        <Grid item marginBottom={8}>
          <CustomButton label="create token" disable={disable} onClick={createTransaction}></CustomButton>
        </Grid>
      </Grid>
    </div>
  );
};

export default TokenMint;
