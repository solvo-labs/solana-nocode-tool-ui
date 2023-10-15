/* eslint-disable @typescript-eslint/no-explicit-any */
import { Grid } from "@mui/material";
import React, { useEffect, useState } from "react";
import Profile, { ProfileLoading } from "../components/Profile";
import SolPrice, { SolPriceLoading } from "../components/SolPrice";
import CurrentBlock from "../components/CurrentBlock";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { makeStyles } from "@mui/styles";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
// import SolTotalStake from "../components/SolTotalStake";
// import SolSupply from "../components/SolSupply";
import StakeClass from "../lib/stakeClass";
import ActiveStake, { StakesLoading } from "../components/ActiveStake";
import { useNavigate } from "react-router-dom";
import { getVestingMyIncoming } from "../lib/vesting";
import ActiveVesting, { VestingLoading } from "../components/ActiveVesting";
import { MarketInfo, TokenData, ToolTips } from "../utils/types";
import { Stream } from "@streamflow/stream/dist/solana";
import { fetchUserTokens } from "../lib";
import { marketInfo } from "../api/solscan";
import RegisterToken, { RegisterTokenLoading } from "../components/NonRegisteredToken";

const useStyles = makeStyles(() => ({
  gridContainer: {
    display: "flex !important",
    justifyContent: "center !important",
    alignItems: "flex-start !important",
    alignContent: "flex-start !important",
    padding: "16px !important",
    height: "100% !important",
  },
  gridItem: {
    padding: "16px !important",
  },
}));

const Main: React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [nonRegisteredToken, setNonRegisteredToken] = useState<Array<TokenData>>([]);
  const [stakes, setStakes] = useState<any[]>([]);
  const [, setStakeClassInstance] = useState<StakeClass>();
  const [balance, setBalance] = useState<number>();
  const [vestingList, setVestingList] = useState<[string, Stream][]>([]);
  const [copy, setCopy] = useState<ToolTips>({
    walletToolTop: false,
  });

  // const [chain, setChain] = useState<ChainInfo>();
  const [lastBlockData, setLastBlockData] = useState<number>(0);
  const [solInfo, setSolInfo] = useState<MarketInfo | undefined>();

  // loading states
  const [walletLoading, setWalletLoading] = useState<boolean>(true);
  const [priceLoading, setPriceLoading] = useState<boolean>(true);
  const [currentBlockLoading, setCurrentBlockLoading] = useState<boolean>(true);
  const [stakesLoading, setStakesLoading] = useState<boolean>(true);
  const [vestingsLoading, setVestingsLoading] = useState<boolean>(true);
  const [nonRegisteredTokenLoading, setNonRegisteredTokenLoading] = useState<boolean>(true);

  const [walletConnection, setWalletConnection] = useState<string>("not connected");

  const handleTooltipOpen = (buttonName: keyof typeof copy, target: any) => {
    setCopy((prevToolTipVisible) => ({
      ...prevToolTipVisible,
      [buttonName]: true,
    }));
    navigator.clipboard.writeText(target);
  };

  const handleTooltipClose = (buttonName: keyof typeof copy) => {
    setCopy({ ...copy, [buttonName]: false });
  };

  useEffect(() => {
    const init = async () => {
      if (publicKey) {
        const balance = await connection.getBalance(publicKey);
        const lastBalance = balance / LAMPORTS_PER_SOL;
        setBalance(lastBalance);
        setWalletConnection("connected");
        setWalletLoading(false);
      }
    };
    init();
  }, [connection, publicKey]);

  useEffect(() => {
    const allStakesFunction = async () => {
      if (publicKey) {
        const stakeClass = new StakeClass(connection, publicKey);
        setStakeClassInstance(stakeClass);
        const allStakes = await stakeClass.fetchAllStakes();
        setStakes(allStakes);
        setStakesLoading(false);
      }
    };
    allStakesFunction();
    const interval = setInterval(() => allStakesFunction(), 20000);
    return () => {
      clearInterval(interval);
    };
  }, [connection, publicKey]);

  useEffect(() => {
    const vestingListFunction = async () => {
      if (publicKey) {
        const data = await getVestingMyIncoming(publicKey.toBase58());
        const sortedData = data?.sort((a, b) => a[1].createdAt - b[1].createdAt);
        setVestingList(sortedData || []);
        setVestingsLoading(false);
      }
    };
    vestingListFunction();
    const interval = setInterval(() => {
      vestingListFunction();
    }, 20000);
    return () => {
      clearInterval(interval);
    };
  }, [publicKey]);

  useEffect(() => {
    const fetchTokenFunction = async () => {
      if (publicKey) {
        const data = await fetchUserTokens(connection, publicKey);
        const filtredData = data.filter((e: any) => !e.metadata.isRegistered);
        setNonRegisteredToken(filtredData);
        setNonRegisteredTokenLoading(false);
      }
    };
    fetchTokenFunction();
    const interval = setInterval(() => {
      fetchTokenFunction();
    }, 20000);
    return () => {
      clearInterval(interval);
    };
  }, [connection, publicKey]);

  useEffect(() => {
    const init = async () => {
      const returnValue = await connection.getBlockHeight();
      setLastBlockData(returnValue);
      setCurrentBlockLoading(false);
    };
    init();
    const interval = setInterval(() => {
      init();
    }, 5000);
    return () => {
      clearInterval(interval);
    };
  }, [connection]);

  useEffect(() => {
    const init = async () => {
      const returnValue = await marketInfo();
      setSolInfo(returnValue);
      setPriceLoading(false);
    };
    init();
    const interval = setInterval(() => {
      init();
    }, 10000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <Grid container spacing={2} className={classes.gridContainer}>
      <Grid item xl={4} lg={4} md={4} sm={12} xs={12} className={classes.gridItem}>
        <Grid container spacing={2}>
          <Grid item xl={12} lg={12} md={12} sm={12} xs={12} className={classes.gridItem}>
            {walletLoading ? (
              <ProfileLoading />
            ) : (
              <Profile
                open={copy.walletToolTop}
                handleTooltipClose={() => handleTooltipClose("walletToolTop")}
                handleTooltipOpen={() => handleTooltipOpen("walletToolTop", publicKey?.toBase58())}
                walletConnection={walletConnection}
                balance={balance ? balance : 0}
                publicKey={publicKey?.toBase58() ? publicKey.toBase58() : "Connect wallet"}
              ></Profile>
            )}
          </Grid>
          <Grid item xl={12} lg={12} md={12} sm={12} xs={12} className={classes.gridItem}>
            {priceLoading ? <SolPriceLoading /> : <SolPrice data={solInfo ? solInfo : undefined} />}
          </Grid>
          <Grid item xl={12} lg={12} md={12} sm={12} xs={12} className={classes.gridItem}>
            {<CurrentBlock lastBlock={lastBlockData} loading={currentBlockLoading}></CurrentBlock>}
          </Grid>
        </Grid>
      </Grid>

      <Grid item xl={8} lg={8} md={8} sm={12} xs={12} className={classes.gridItem}>
        <Grid container spacing={2}>
          <Grid item xl={12} lg={12} md={12} sm={12} xs={12} className={classes.gridItem}>
            {stakesLoading ? <StakesLoading /> : <ActiveStake navigate={() => navigate("/stake")} stakes={stakes}></ActiveStake>}
          </Grid>
          <Grid item xl={12} lg={12} md={12} sm={12} xs={12} className={classes.gridItem}>
            {vestingsLoading ? <VestingLoading /> : <ActiveVesting navigate={() => navigate("/vesting-list")} vestings={vestingList}></ActiveVesting>}
          </Grid>
          <Grid item xl={12} lg={12} md={12} sm={12} xs={12} className={classes.gridItem}>
            {nonRegisteredTokenLoading ? <RegisterTokenLoading /> : <RegisterToken tokens={nonRegisteredToken}></RegisterToken>}
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Main;
