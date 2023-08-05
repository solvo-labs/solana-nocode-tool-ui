import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { makeStyles } from "@mui/styles";
import { Grid, LinearProgress, Theme } from "@mui/material";
import TopBar from "../components/TopBar";
import { useWallet } from "@solana/wallet-adapter-react";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useStyles = makeStyles((_theme: Theme) => ({
  container: {
    color: "#FFFFFF",
    justifyContent: "center",
  },
}));

const ProtectedRoute: React.FC = () => {
  const classes = useStyles();
  const [loading, setLoading] = useState<boolean>(true);

  const { connected, publicKey, connecting } = useWallet();

  useEffect(() => {
    if (publicKey === undefined) {
      setLoading(false);
    }

    if (publicKey) {
      setLoading(false);
    }

    if (localStorage.getItem("walletName") === null) {
      setLoading(false);
    }
  }, [publicKey]);

  if (loading || connecting) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          width: "50vw",
        }}
      >
        <LinearProgress color="inherit" style={{ width: "80%" }} />
      </div>
    );
  }

  return connected ? (
    <Grid container spacing={0} className={classes.container}>
      <TopBar />
      <Grid
        item
        lg={12}
        md={12}
        xs={12}
        height={"100vh"}
        paddingTop={{ xl: "6rem", md: "6rem", sm: "4rem", xs: "4rem" }}
      >
        <Grid container direction={"column"} spacing={0}>
          <Outlet />
        </Grid>
      </Grid>
    </Grid>
  ) : (
    <Navigate to="/login" />
  );
};

export default ProtectedRoute;
