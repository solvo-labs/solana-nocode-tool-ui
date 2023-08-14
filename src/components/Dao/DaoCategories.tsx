import React from "react";
import { Grid, Paper, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: "flex",
    justifyContent: "center", // Yatayda ortala
    height: "9rem",
  },
  box: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    background: "linear-gradient(to right, #aa66fe, #23ed98)",
    borderRadius: "0.5rem",
    color: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "1rem",
  },
}));

type Props = {
  label: string;
  icon: unknown;
};

const DaoCategories: React.FC<Props> = ({ label, icon }) => {
  const classes = useStyles();

  return (
    <Grid container className={classes.container}>
      <Typography className={classes.label} variant="h5">
        {label}
        {icon}
      </Typography>
    </Grid>
  );
};

export default DaoCategories;
