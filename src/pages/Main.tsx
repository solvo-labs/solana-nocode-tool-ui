import { Grid, Theme } from "@mui/material";
import React, { useEffect, useState } from "react";
import Profile from "../components/Profile";
import Network from "../components/Network";
import SolPrice from "../components/SolPrice";
import CurrentBlock from "../components/CurrentBlock";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { makeStyles } from "@mui/styles";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    minWidth: "80vw",
    [theme.breakpoints.down("sm")]: {
      minWidth: "80vw",
    },
  },
}));

const Main: React.FC = () => {
  const { publicKey } = useWallet();
  const classes = useStyles();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number>();

  useEffect(() => {
    const init = async () => {
      if (publicKey) {
        const balance = await connection.getBalance(publicKey);
        const lastBalance = balance / LAMPORTS_PER_SOL
        setBalance(lastBalance);
      }
    }
    init();
  }, [connection, publicKey])
  
  
  return (
    <Grid container spacing={2} className={classes.container}>
      <Grid item xl={4} lg={4} md={6}>
        <SolPrice />
      </Grid>
      <Grid item xl={4} lg={4} md={6}>
        <Profile
          balance={balance ? balance : 0}
          publicKey={
            publicKey?.toBase58() ? publicKey.toBase58() : "Connect wallet"
          }
        ></Profile>
      </Grid>
      <Grid item xl={4} lg={4} md={12}>
        <CurrentBlock></CurrentBlock>
      </Grid>
    </Grid>
  );
};

export default Main;
