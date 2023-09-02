import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { makeStyles } from "@mui/styles";
import { Divider, Grid, Theme, Typography } from "@mui/material";
import Token from "../../components/Token/Token";
import { TokenWithType } from "../../utils/types";
import { TOKEN_TYPES } from "../../utils/enum";

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
    <div>
      <Grid container className={classes.container} direction={"column"}>
        <Grid item marginBottom={"2rem"}>
          <Typography variant="h5" className={classes.title}>
            Token Mint
          </Typography>
          <Divider sx={{ marginTop: "1rem", background: "white" }} />
        </Grid>
        <Token tokenOnChange={setTokenData} token={tokenData} fileOnChange={setFile} file={file} isNavigate={true} />
      </Grid>
    </div>
  );
};

export default TokenMint;
