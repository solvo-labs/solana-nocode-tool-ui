import React from "react";
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

  const { connected, connecting } = useWallet();

  if (connecting) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <LinearProgress color="inherit" style={{ width: "80%" }} />
      </div>
    );
  }

  return connected ? (
    <Grid container spacing={2} className={classes.container}>
      <TopBar />
      <Grid item lg={10} md={12} xs={12}>
        <Grid container direction={"column"} spacing={2}>
          <Outlet />
        </Grid>
      </Grid>
    </Grid>
  ) : (
    <Navigate to="/login" />
  );
};

export default ProtectedRoute;
