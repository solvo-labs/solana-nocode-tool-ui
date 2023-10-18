import React from "react";
import { FormControl, Grid, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
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
  formControl: {
    margin: "16px 0 !important",
  },
}));

interface MultisignDaoDetailsProps {
  daoName: string;
  publicKeys: string[];
  duration: number;
  onChange: (e: any) => void;
  removeHash: (e: any) => void;
  handleDAOMembers: (e: any) => void;
  onBlur: (e: any) => void;
  handleDuration: (drt: number) => void;
}

const MultisignDaoDetails: React.FC<MultisignDaoDetailsProps> = ({ onChange, daoName, publicKeys, duration, removeHash, handleDAOMembers, onBlur, handleDuration }) => {
  const classes = useStyles();
  const defaultValue = "DAY";

  return (
    <Grid container spacing={2} className={classes.gridContainer}>
      <Grid item xs={8} className={classes.grid}>
        <Typography className={classes.title}>Let's begin, shall we?</Typography>
        <Typography className={classes.description}>What is the name of your wallet?</Typography>
        <Typography>Opting for a name that's both memorable and descriptive is the ideal choice for you and your team.</Typography>
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
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", padding: "16px" }}>
              <FormControl style={{ width: "25%", paddingRight: "10px" }} className={classes.formControl}>
                <InputLabel id="duration-label">Duration</InputLabel>
                <Select
                  style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
                  labelId="duration-label"
                  id="duration-select"
                  value={duration}
                  onChange={(e) => handleDuration(e.target.value as number)}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                    <MenuItem key={value} value={value}>
                      {value}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl style={{ width: "75%", paddingLeft: "10px" }} className={classes.formControl}>
                <InputLabel id="select-label">Select a duration</InputLabel>
                <Select labelId="select-label" id="select" value={defaultValue}>
                  <MenuItem value="DAY">DAY</MenuItem>
                </Select>
              </FormControl>
            </div>
          </Grid>
        </Grid>
      )}
    </Grid>
  );
};

export default MultisignDaoDetails;
