import { Grid, Theme } from "@mui/material";
import React, { useEffect, useState } from "react";
import Profile from "../components/Profile";
import SolPrice from "../components/SolPrice";
import CurrentBlock from "../components/CurrentBlock";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { makeStyles } from "@mui/styles";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import SolNetwork from "../components/SolNetwork";
// import SolTotalStake from "../components/SolTotalStake";
// import SolSupply from "../components/SolSupply";
import StakeClass from "../lib/stakeClass";
import ActiveStake from "../components/ActiveStake";
import { useNavigate } from "react-router-dom";
import { getVestingMyOwn } from "../lib/vesting";
import ActiveVesting from "../components/ActiveVesting";
import { ChainInfo, MarketInfo, TokenData, ToolTips } from "../utils/types";
import { Stream } from "@streamflow/stream/dist/solana";
import { fetchUserTokens } from "../lib";
import { lastBlock, marketInfo, networkInfo } from "../api/solscan";
import RegisterToken from "../components/NonRegisteredToken";

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    maxWidth: "80vw",
    marginBottom: "1rem !important",
    [theme.breakpoints.down("xl")]: {
      maxWidth: "90vw",
      // marginTop: "1rem !important",
    },
    [theme.breakpoints.down("md")]: {
      marginTop: "2rem !important",
    },
  },
}));

const Main: React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [nonRegisteredToken, setNonRegisteredToken] = useState<
    Array<TokenData>
  >([]);
  const [stakes, setStakes] = useState<any[]>([]);
  const [, setStakeClassInstance] = useState<StakeClass>();
  const [balance, setBalance] = useState<number>();
  const [vestingList, setVestingList] = useState<[string, Stream][]>([]);
  const [copy, setCopy] = useState<ToolTips>({
    walletToolTop: false,
  });

  const [chain, setChain] = useState<ChainInfo>();
  const [lastBlockData, setLastBlockData] = useState<number>(0);
  const [solInfo, setSolInfo] = useState<MarketInfo | undefined>();

  const [walletConnection, setWalletConnection] =
    useState<string>("not connected");

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
      }
    };
    allStakesFunction();
    const interval = setInterval(() => allStakesFunction(), 10000);
    return () => {
      clearInterval(interval);
    };
  }, [connection, publicKey]);

  useEffect(() => {
    const vestingListFunction = async () => {
      if (publicKey) {
        const data = await getVestingMyOwn(publicKey.toBase58());
        const sortedData = data?.sort(
          (a, b) => a[1].createdAt - b[1].createdAt
        );
        setVestingList(sortedData || []);
      }
    };
    vestingListFunction();
    const interval = setInterval(() => {
      vestingListFunction();
    }, 10000);
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
      }
    };
    fetchTokenFunction();
    const interval = setInterval(() => {
      fetchTokenFunction();
    }, 5000);
    return () => {
      clearInterval(interval);
    };
  }, [connection, publicKey]);

  useEffect(() => {
    const marketInfoFunction = async () => {
      const returnValue = await networkInfo();
      setChain(returnValue);
    };
    marketInfoFunction();
    const interval = setInterval(() => {
      marketInfoFunction();
    }, 5000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const init = async () => {
      const returnValue = await lastBlock();
      setLastBlockData(returnValue);
    };
    init();
    const interval = setInterval(() => {
      init();
    }, 5000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const init = async () => {
      const returnValue = await marketInfo();
      setSolInfo(returnValue);
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
    <Grid container spacing={2} className={classes.container}>
      {/* --------------------------------------------------------------------------------------------- en dis grid */}
      <Grid item xl={4} lg={4} md={4} sm={12} xs={12}>
        <Grid container spacing={2}>
          <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
            <Profile
              open={copy.walletToolTop}
              handleTooltipClose={() => handleTooltipClose("walletToolTop")}
              handleTooltipOpen={() =>
                handleTooltipOpen("walletToolTop", publicKey?.toBase58())
              }
              walletConnection={walletConnection}
              balance={balance ? balance : 0}
              publicKey={
                publicKey?.toBase58() ? publicKey.toBase58() : "Connect wallet"
              }
            ></Profile>
          </Grid>
          <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
            <SolPrice data={solInfo ? solInfo : undefined} />
          </Grid>
          <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
            <CurrentBlock lastBlock={lastBlockData}></CurrentBlock>
          </Grid>
          <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
            <SolNetwork data={chain}></SolNetwork>
          </Grid>
          {/* <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
            <SolTotalStake></SolTotalStake>
          </Grid>
          <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
            <SolSupply></SolSupply>
          </Grid> */}
        </Grid>
      </Grid>
      {/* --------------------------------------------------------------------------------------------- en dis grid */}
      <Grid item xl={8} lg={8} md={8} sm={12} xs={12}>
        <Grid container spacing={2}>
          <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
            <ActiveStake
              navigate={() => navigate("/stake")}
              stakes={stakes}
            ></ActiveStake>
          </Grid>
          <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
            <ActiveVesting
              navigate={() => navigate("/vesting-list")}
              vestings={vestingList}
            ></ActiveVesting>
          </Grid>
          <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
            <RegisterToken tokens={nonRegisteredToken}></RegisterToken>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Main;
