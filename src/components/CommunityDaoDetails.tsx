import React from "react";
import { Grid, TextField, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles(() => ({
  gridContainer: {
    justifyContent: "center !important",
    padding: "16px !important",
  },
  gridItem: {
    padding: "32px !important",
  },
  card: {
    borderRadius: "16px !important",
    border: "1px solid rgba(255, 255, 255, 0.36) !important",
    background: "linear-gradient(109deg, rgba(255, 255, 255, 0.40) 2.16%, rgba(255, 255, 255, 0.10) 100%) !important",
    boxShadow: "0px 4px 24px -1px rgba(0, 0, 0, 0.20) !important",
    backdropFilter: "blur(20px) !important",
    paddingRight: "20px !important",
    paddingLeft: "20px !important",
    paddingTop: "40px !important",
    paddingBottom: "40px !important",
  },
  title: {
    fontSize: "40px !important",
    fontWeight: "600 !important",
    textAlign: "center",
  },
  description: {
    fontSize: "18px !important",
    fontWeight: "600 !important",
    marginBottom: "10px !important",
  },
  textField: {
    width: "100% !important",
    marginTop: "16px !important",
  },
}));

interface CommunityDaoDetailsProps {
  onChange: (e: any) => void;
}

const CommunityDaoDetails: React.FC<CommunityDaoDetailsProps> = ({ onChange }) => {
  const classes = useStyles();

  return (
    <Grid container spacing={2} className={classes.gridContainer}>
      <Grid item xs={8} className={classes.gridItem}>
        <Typography className={classes.title}>Let's get started</Typography>
      </Grid>

      <Grid item xs={8} className={`${classes.gridItem}, ${classes.card}`}>
        <Typography className={classes.description}>What is the name of your DAO?</Typography>
        <Typography>It's best to choose a descriptive, memorable name for you and your members.</Typography>

        <TextField className={classes.textField} id="community-dao-name" label="e.g. DAO Name" variant="standard" onChange={onChange} />
      </Grid>
    </Grid>
  );
};

export default CommunityDaoDetails;
