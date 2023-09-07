import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { makeStyles } from "@mui/styles";
import { Grid } from "@mui/material";
import Token from "../../components/Token/Token";
import { TokenWithType } from "../../utils/types";
import { TOKEN_TYPES } from "../../utils/enum";
import Title from "../../components/Title";

const useStyles = makeStyles(() => ({
  tokenMintContainer: {
    borderRadius: "0.5rem",
    background: "#f4f4f5",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    border: "3px solid #5719A3",
    padding: "1.5rem",
    margin: "0.5rem",
  },
  select: {
    width: "100%",
  },
}));

const TokenMint: React.FC = () => {
  const { publicKey } = useWallet();
  const [file, setFile] = useState<any>();
  const [tokenData, setTokenData] = useState<TokenWithType>({
    type: TOKEN_TYPES.NEW_TOKEN,
    name: "",
    symbol: "",
    amount: 0,
    decimal: 8,
    freezeAuthority: publicKey?.toBase58(),
    authority: publicKey?.toBase58(),
  });

  const classes = useStyles();

  return (
    <Grid container className={classes.tokenMintContainer} direction={"column"}>
      <Title label="Token Mint" />
      <Token tokenOnChange={setTokenData} token={tokenData} fileOnChange={setFile} file={file} isNavigate={true} />
    </Grid>
  );
};

export default TokenMint;
