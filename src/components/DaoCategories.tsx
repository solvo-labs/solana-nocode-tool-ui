import React from "react";
import { Grid, Paper, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    width: "100%",
    padding: "0.5rem", // Kutu içeriği için boşluk
    display: "flex",
    justifyContent: "center", // Yatayda ortala
  },
  box: {
    width: "100%",
    background: "linear-gradient(to right, #aa66fe, #23ed98)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem",
    borderRadius: "0.5rem", // Kenar yuvarlatma
    height: "100%", // Kutu yüksekliğini 100% yaparak ortala
  },
  label: {
    color: "white",
  },
}));

type Props = {
  label: string;
  index: number;
  icon: unknown;
};

const DaoCategories: React.FC<Props> = ({ label, index, icon }) => {
  const classes = useStyles();

  return (
    <Grid container direction="row" spacing={2}>
      <Grid container className={classes.container} xs={12} sm={6}>
        <Grid container className={classes.boxContainer} spacing={2}>
          <Paper style={{ height: "100px" }} className={classes.box}>
            <Typography className={classes.label} variant="h5">
              {label}
            </Typography>
            {icon}
          </Paper>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default DaoCategories;
