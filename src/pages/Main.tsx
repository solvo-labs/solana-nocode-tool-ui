import { Grid, Theme } from "@mui/material";
import React, { useEffect, useState } from "react";
import Profile from "../components/Profile";
import SolPrice from "../components/SolPrice";
import CurrentBlock from "../components/CurrentBlock";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { makeStyles } from "@mui/styles";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import SolNetwork from "../components/SolNetwork";
import SolTotalStake from "../components/SolTotalStake";
import SolSupply from "../components/SolSupply";
import StakeClass from "../lib/stakeClass";
import ActiveStake from "../components/ActiveStake";
import { useNavigate } from "react-router-dom";
import { getVestingMyOwn } from "../lib/vesting";
import ActiveVesting from "../components/ActiveVesting";

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
  const classes = useStyles();
  const navigate = useNavigate();
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [stakes, setStakes] = useState<any[]>([]);
  const [stakeClassInstance, setStakeClassInstance] = useState<StakeClass>();
  const [balance, setBalance] = useState<number>();
  const [vestingList, setVestingList] = useState<[string, Stream][]>([]);


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

  useEffect(() => {
    const init = async () => {
      if (publicKey) {
        const stakeClass = new StakeClass(connection, publicKey);
        setStakeClassInstance(stakeClass);
        const allStakes = await stakeClass.fetchAllStakes();
        setStakes(allStakes);
      }
    };
    init();
    const interval = setInterval(() => init(), 10000);
    return () => {
      clearInterval(interval);
    };
  }, [connection, publicKey]);

  
  useEffect(() => {
    const init = async () => {
      if (publicKey) {
        const data = await getVestingMyOwn(publicKey.toBase58());
        const sortedData = data?.sort((a, b) => a[1].createdAt - b[1].createdAt);
        setVestingList(sortedData || []);
        // setLoading(false);
      }
    };

    init();
    const interval = setInterval(() => {
      init();
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [publicKey]);
  console.log(vestingList);

  return (
    <Grid container spacing={2} className={classes.container}>
      {/* --------------------------------------------------------------------------------------------- en dis grid */}
      <Grid item xl={4} lg={4} md={4} sm={12} xs={12}>
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
            <SolPrice />
          </Grid>
          <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
            <CurrentBlock></CurrentBlock>
          </Grid>
          <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
            <SolNetwork></SolNetwork>
          </Grid>
          <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
            <SolTotalStake></SolTotalStake>
          </Grid>
          <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
            <SolSupply></SolSupply>
          </Grid>
        </Grid>
      </Grid>
      {/* --------------------------------------------------------------------------------------------- en dis grid */}
      <Grid item xl={8} lg={8} md={8} sm={12} xs={12}>
        <Grid container spacing={2}>
         
          {/* <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
            <LastCard></LastCard>
          </Grid> */}
          <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
            <ActiveStake navigate={()=> navigate("/stake")} stakes={stakes}></ActiveStake>
          </Grid>
          <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
            <ActiveVesting navigate={()=> navigate("/vesting-list")} vestings={vestingList}></ActiveVesting>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Main;
