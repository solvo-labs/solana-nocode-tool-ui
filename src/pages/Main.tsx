import { Grid, Theme } from "@mui/material";
import React, { useEffect, useState } from "react";
import Profile from "../components/Profile";
import SolPrice from "../components/SolPrice";
import CurrentBlock from "../components/CurrentBlock";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { makeStyles } from "@mui/styles";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import WalletDetail from "../components/WalletDetail";
import SolNetwork from "../components/SolNetwork";
import SolTotalStake from "../components/SolTotalStake";
import SolSupply from "../components/SolSupply";
import LastCard from "../components/LastCards";

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    maxWidth: "80vw",
    marginBottom: "1rem !important",
    [theme.breakpoints.down("xl")]: {
      maxWidth: "90vw",
      marginTop: "1rem !important",
    },
    [theme.breakpoints.down("sm")]: {
      marginTop: "2rem !important",
    },
  },
}));

const Main: React.FC = () => {
  const { publicKey } = useWallet();
  const classes = useStyles();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number>();
  const [walletConnection, setWalletConnection] =
    useState<string>("not connected");

  useEffect(() => {
    const init = async () => {
      if (publicKey) {
        const balance = await connection.getBalance(publicKey);
        const lastBalance = balance / LAMPORTS_PER_SOL;
        setBalance(lastBalance);
        setWalletConnection("connected");
      }
    };
    init();
  }, [connection, publicKey]);

  return (
    <Grid container spacing={2} className={classes.container}>
      {/* --------------------------------------------------------------------------------------------- en dis grid */}
      <Grid item xl={4} lg={4} md={6} sm={12} xs={12}>
        <Grid container spacing={2}>
          <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
            <Profile
              walletConnection={walletConnection}
              balance={balance ? balance : 0}
              publicKey={
                publicKey?.toBase58() ? publicKey.toBase58() : "Connect wallet"
              }
            ></Profile>
          </Grid>
          <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
            <WalletDetail></WalletDetail>
          </Grid>
        </Grid>
      </Grid>
      {/* --------------------------------------------------------------------------------------------- en dis grid */}
      <Grid item xl={8} lg={8} md={6} sm={12} xs={12}>
        <Grid container spacing={2}>
          <Grid item xl={6} lg={6} md={12} sm={12} xs={12}>
            <SolPrice />
          </Grid>
          <Grid item xl={6} lg={6} md={12} sm={12} xs={12}>
            <CurrentBlock></CurrentBlock>
          </Grid>
          <Grid item xl={4} lg={4} md={12} sm={12} xs={12}>
            <SolNetwork></SolNetwork>
          </Grid>
          <Grid item xl={4} lg={4} md={12} sm={12} xs={12}>
            <SolTotalStake></SolTotalStake>
          </Grid>
          <Grid item xl={4} lg={4} md={12} sm={12} xs={12}>
            <SolSupply></SolSupply>
          </Grid>
          <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
            <LastCard></LastCard>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Main;
