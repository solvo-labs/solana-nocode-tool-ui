import React, { useState } from "react";
import { CircularProgress, Grid, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { NFTStorage } from "nft.storage";
import toastr from "toastr";
import { PublicKey, Transaction } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, createMintToInstruction } from "@solana/spl-token";
import { register } from "../../lib/tokenRegister";
import { createMint, getOrCreateAssociatedTokenAccount } from "../../lib/token";
import ImageUpload from "../ImageUpload";
import { CustomInput } from "../Custom/CustomInput";
import { TokenWithType } from "../../utils/types";
import { CustomButton } from "../Custom/CustomButton";
import { makeStyles } from "@mui/styles";

type Props = {
  tokenOnChange: (value: TokenWithType) => void;
  token: TokenWithType;
  fileOnChange: (value: any) => void;
  file: any;
  isNavigate: boolean;
  showButton: boolean;
};

const useStyles = makeStyles(() => ({
  tokenContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  transactionButton: {
    display: "flex",
    justifyContent: "center",
    marginTop: "0.5rem !important",
  },
}));

const Token: React.FC<Props> = ({ tokenOnChange, token, fileOnChange, file, isNavigate, showButton }) => {
  const [loading, setLoading] = useState(false);

  const classes = useStyles();
  const { connection } = useConnection();
  const navigate = useNavigate();
  const { publicKey, sendTransaction } = useWallet();

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
      const { transaction, toAccount } = await createMint(connection, publicKey, token.freezeAuthority ? new PublicKey(token.freezeAuthority) : publicKey, token.decimal);

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
            token.authority ? new PublicKey(token.authority) : publicKey,
            token.amount * Math.pow(10, token.decimal),
            [],
            TOKEN_PROGRAM_ID
          )
        );

        let uri = "";

        if (file) {
          uri = await storeImage();
        }

        const transaction4 = register(toAccount.publicKey.toBase58(), publicKey, { name: token.name, symbol: token.symbol, uri });

        const finalTransactions = new Transaction();
        finalTransactions.add(transaction);
        finalTransactions.add(transaction2!);
        finalTransactions.add(transaction3);
        finalTransactions.add(transaction4);

        const signature = await sendTransaction(finalTransactions, connection, { minContextSlot, signers: [toAccount] });
        await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature: signature });

        toastr.success("Token Mint completed successfully");
        if (isNavigate) navigate("/my-tokens");
        setLoading(false);
      } catch (error: any) {
        toastr.error(error);
        setLoading(false);
      }
    }
  };

  const disable = !(token.name && token.symbol && token.amount && token.decimal);

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
    <Grid container className={classes.tokenContainer} direction={"column"}>
      <Stack direction={"row"} spacing={3}>
        <Stack direction={"column"}>
          <ImageUpload file={file} setFile={(data) => fileOnChange(data)} />
          <CustomInput
            placeholder="Name"
            label="Name"
            id="name"
            name="name"
            type="text"
            value={token.name}
            onChange={(e: any) => tokenOnChange({ ...token, name: e.target.value })}
            disable={false}
          ></CustomInput>
          <CustomInput
            placeholder="Symbol"
            label="Symbol"
            id="symbol"
            name="symbol"
            type="text"
            value={token.symbol}
            onChange={(e: any) => tokenOnChange({ ...token, symbol: e.target.value })}
            disable={false}
          ></CustomInput>
        </Stack>

        <Stack direction={"column"} spacing={2} alignItems={"center"}>
          <CustomInput
            placeholder="Amount"
            label="Amount"
            id="amount"
            name="amount"
            type="text"
            value={token.amount}
            onChange={(e: any) => tokenOnChange({ ...token, amount: e.target.value })}
            disable={false}
          ></CustomInput>
          <CustomInput
            placeholder="Decimal"
            label="Decimal"
            id="decimal"
            name="decimal"
            type="text"
            value={token.decimal}
            onChange={(e: any) => tokenOnChange({ ...token, decimal: e.target.value })}
            disable={false}
          />
          <CustomInput
            placeholder="Authority"
            label="Authority"
            id="authority"
            name="authority"
            type="text"
            value={token.authority || ""}
            onChange={(e: any) => tokenOnChange({ ...token, authority: e.target.value })}
            disable={false}
          />
          <CustomInput
            placeholder="Freeze Authority"
            label="Freeze Authority"
            id="freezeAuthority"
            name="freezeAuthority"
            type="text"
            value={token.freezeAuthority || ""}
            onChange={(e: any) => tokenOnChange({ ...token, freezeAuthority: e.target.value })}
            disable={false}
          />
        </Stack>
      </Stack>
      {showButton && (
        <Grid item className={classes.transactionButton}>
          <CustomButton label="create token" disable={disable} onClick={createTransaction}></CustomButton>
        </Grid>
      )}
    </Grid>
  );
};

export default Token;
