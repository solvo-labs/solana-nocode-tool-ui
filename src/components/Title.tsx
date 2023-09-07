import { Divider, Grid, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import React from "react";

const useStyles = makeStyles(() => ({
  title: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    margin: "1.5rem",
  },
}));

type Props = {
  label: string;
};

const Title: React.FC<Props> = ({ label }) => {
  const classes = useStyles();

  return (
    <Grid container className={classes.title} direction={"column"}>
      <Typography variant="h5">{label}</Typography>
      <Divider sx={{ width: "100%" }} />
    </Grid>
  );
};

export default Title;
