import React from "react";
import { Outlet } from "react-router-dom";
import { makeStyles } from "@mui/styles";
import { Grid, Theme } from "@mui/material";
import TopBar from "../components/TopBar";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useStyles = makeStyles((_theme: Theme) => ({
  container: {
    color: "#FFFFFF",
    justifyContent: "center",
  },
}));

const ProtectedRoute: React.FC = () => {
  const classes = useStyles();

  return (
    <Grid container spacing={2} className={classes.container}>
      <TopBar />
      <Grid item lg={10} md={12} xs={12}>
        <Grid container direction={"column"} spacing={2}>
          <Outlet />
        </Grid>
      </Grid>
    </Grid>
  );
};

export default ProtectedRoute;
