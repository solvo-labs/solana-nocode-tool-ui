import React from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Grid, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import solanaLogoPng from "../assets/solana-logo.png";
import { APP_NAME } from "../utils/enum";

const useStyles = makeStyles((_theme: Theme) => ({
  outerContainer: {
    padding: "1rem",
    border: "1px solid linear-gradient(to right, #aa66fe, #23ed98)",
    background: "linear-gradient(to right, #aa66fe, #23ed98)",
    borderRadius: "0.5rem",
    justifyContent: "center",
    alignItems: "center",
  },
  innerContainer: { justifyContent: "center", alignItems: "center" },
  image: { margin: "1.5rem 0", transition: "background-color 300ms" },
  button: { background: "#CD2EF8" },
}));

const Login: React.FC = () => {
  const classes = useStyles();
  const { connected } = useWallet();
  const navigate = useNavigate();

  if (connected) {
    navigate("/");
  }

  return (
    <Grid container className={classes.outerContainer}>
      <Grid container direction="column" className={classes.innerContainer}>
        {/* #7846B5 */}
        <Typography variant="h4" color="#5719A3">
          {APP_NAME.SOLANA}
        </Typography>
        <img className={classes.image} width={200} src={solanaLogoPng} />
      </Grid>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <WalletMultiButton className={classes.button} />
      </div>
    </Grid>
  );
};

export default Login;
