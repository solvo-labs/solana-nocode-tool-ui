import React from "react";
import { Grid, TextField, Typography } from "@mui/material";
import remove from "../assets/remove.png";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles(() => ({
  gridContainer: {
    justifyContent: "center !important",
    padding: "16px !important",
  },
  grid: {
    padding: "16px !important",
  },
  title: {
    fontSize: "40px !important",
    fontWeight: "600 !important",
  },
  description: {
    fontSize: "25px !important",
    fontWeight: "600 !important",
  },
  daoInput: {
    width: "100% !important",
  },
  memberSide: {
    display: "flex !important",
    justifyContent: "flex-start !important",
    alignItems: "center !important",
    marginBottom: "10px !important",
  },
  members: {
    display: "flex !important",
    justifyContent: "center !important",
    alignItems: "center !important",
    background: "linear-gradient(90deg, rgba(238,174,202,1) 0%, rgba(148,187,233,1) 100%) !important",
    padding: "15px !important",
    textAlign: "center",
    borderRadius: "50% !important",
    width: "20px !important",
    height: "20px !important",
    marginRight: "10px !important",
  },
  memberHashs: {
    display: "flex !important",
    justifyContent: "space-between !important",
    alignItems: "center !important",
    width: "100% !important",
  },
  removeIcon: {
    width: "20px !important",
    marginLeft: "10px !important",
    cursor: "pointer !important",
  },
}));

interface MultisignDaoDetailsProps {
  daoName: string;
  publicKeys: string[];
  onChange: (e: any) => void;
  removeHash: (e: any) => void;
  handleDAOMembers: (e: any) => void;
  onBlur: (e: any) => void;
}

const MultisignDaoDetails: React.FC<MultisignDaoDetailsProps> = ({ onChange, daoName, publicKeys, removeHash, handleDAOMembers, onBlur }) => {
  const classes = useStyles();

  return (
    <Grid container spacing={2} className={classes.gridContainer}>
      <Grid item xs={8} className={classes.grid}>
        <Typography className={classes.title}>Let's get started</Typography>
        <Typography className={classes.description}>What is the name of your wallet?</Typography>
        <Typography>It's best to choose a descriptive, memorable name for you and your members.</Typography>
      </Grid>

      <Grid item xs={8} className={classes.grid}>
        <TextField className={classes.daoInput} id="dao-name" label="e.g. DAO Name" variant="standard" onChange={onChange} />
      </Grid>

      {daoName && (
        <Grid item xs={8}>
          <Grid container spacing={2}>
            <Grid item xs={12} className={classes.grid}>
              <Typography className={classes.title}>Next, invite members with their Solana Wallet Address.</Typography>
              <Typography className={classes.description}>Invite members {publicKeys.length}</Typography>
              <Typography>Add Solana wallet addressses</Typography>
            </Grid>
            <Grid item xs={12} className={classes.grid}>
              {publicKeys.map((hash, index) => (
                <div key={index} className={classes.memberSide}>
                  <div className={classes.members}>
                    <Typography>{index === 0 ? "Me:" : `${index + 1}:`}</Typography>
                  </div>
                  <div className={classes.memberHashs}>
                    {hash} {index !== 0 ? <img onClick={() => removeHash(index)} className={classes.removeIcon} src={remove} alt="remove icon" /> : <></>}
                  </div>
                </div>
              ))}
            </Grid>
            <Grid item xs={12} className={classes.grid}>
              <TextField className={classes.daoInput} id="dao-members" label="e.g. hash" variant="standard" onKeyDown={handleDAOMembers} onBlur={onBlur} />
            </Grid>
          </Grid>
        </Grid>
      )}
    </Grid>
  );
};

export default MultisignDaoDetails;
