import React from "react";
import { FormControl, Grid, InputLabel, MenuItem, OutlinedInput, Select, Slider, TextField, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import Checkbox from "@mui/material/Checkbox";
import remove from "../assets/remove.png";

const useStyles = makeStyles(() => ({
  gridContainer: {
    justifyContent: "center !important",
    padding: "16px !important",
  },
  gridItem: {
    padding: "16px !important",
  },
  mainItem: {
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
  mainTitle: {
    fontSize: "40px !important",
    fontWeight: "600 !important",
    textAlign: "center",
  },
  title: {
    fontSize: "18px !important",
    fontWeight: "600 !important",
  },
  description: {
    fontSize: "18px !important",
    fontWeight: "600 !important",
    margin: "15px 0 10px 0 !important",
  },
  address: {
    fontSize: "18px !important",
    fontWeight: "600 !important",
    margin: "16px 0 10px 0 !important",
  },
  textField: {
    margin: "16px 0 !important",
    width: "100% !important",
  },
  removeIcon: {
    width: "20px !important",
    marginLeft: "10px !important",
    cursor: "pointer !important",
  },
  memberSide: {
    display: "flex !important",
    justifyContent: "flex-start !important",
    alignItems: "center !important",
    margin: "16px 0 !important",
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
  sliderSection: {
    display: "flex !important",
    justifyContent: "center !important",
    alignItems: "center !important",
    marginTop: "20px !important",
    padding: "30px !important",
    background: "linear-gradient(45deg, rgba(42,229,157,1) 0%, rgba(168,103,253,1) 100%) !important",
    borderRadius: "16px !important",
    color: "black !important",
  },
  threshold: {
    border: "1px solid #000 !important",
    padding: "10px !important",
    margin: "10px !important",
    borderRadius: "8px !important",
    minWidth: "50px !important",
    textAlign: "center",
  },
  slider: {
    margin: "20px !important",
    height: "15px !important",
    color: "#47DDA5 !important",
    width: "100% !important",
  },
  percentageSection: {
    marginTop: "20px !important",
    backgroundColor: "#3d3d3d !important",
    width: "100% !important",
    borderRadius: "16px !important",
  },
  percentageSectionText: {
    padding: "20px !important",
  },
  percentageSectionNumber: {
    color: "#43DAA5 !important",
    fontWeight: "600 !important",
  },
  note: {
    color: "#000 !important",
    fontSize: "18px !important",
  },
  generator: {
    display: "flex !important",
    justifyContent: "flex-start !important",
    alignItems: "center !important",
    // marginBottom: "16px !important",
  },
  formControl: {
    margin: "16px 0 !important",
  },
}));

interface CommunityDaoTokenProps {
  daoTokensForCommunity: string[];
  choosenDaoTokenName: string[];
  createdDaoToken: string[];
  daoCommunityTokenChecked: boolean;
  handleUseToken: (e: any) => void;
  createNewDaoToken: (e: any) => void;
  handleChoosenDaoToken: (e: any) => void;
  removeCreatedDaoTokens: (e: any) => void;
  handleCommunityThresholdRange: (e: any) => void;
  handleMinNumberToEditDao: (e: any) => void;
  communityThreshold: number;
}

const CommunityDaoToken: React.FC<CommunityDaoTokenProps> = ({
  daoCommunityTokenChecked,
  handleUseToken,
  createNewDaoToken,
  daoTokensForCommunity,
  choosenDaoTokenName,
  handleChoosenDaoToken,
  createdDaoToken,
  removeCreatedDaoTokens,
  handleCommunityThresholdRange,
  communityThreshold,
  handleMinNumberToEditDao,
}) => {
  const classes = useStyles();

  return (
    <Grid container spacing={2} className={classes.gridContainer}>
      <Grid item xs={8} className={classes.mainItem}>
        <Typography className={classes.mainTitle}>Next, determine the DAO’s community token.</Typography>
      </Grid>

      <Grid item xs={8} className={`${classes.gridItem}, ${classes.card}`}>
        <Typography className={classes.description}>Do you have an existing token for your DAO's community?</Typography>
        <Typography>Holders of this token will be able to vote and/or edit your DAO. You can choose your DAO's community tokens or create new one from below.</Typography>

        <FormControl fullWidth disabled={daoCommunityTokenChecked ? true : false} className={classes.formControl}>
          <InputLabel id="demo-simple-select-label">Tokens</InputLabel>
          <Select labelId="demo-simple-select-label" id="demo-simple-select" value={choosenDaoTokenName} onChange={handleChoosenDaoToken} input={<OutlinedInput label="Tokens" />}>
            {daoTokensForCommunity.map((tk, index) => (
              <MenuItem key={index} value={tk}>
                {tk}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {!daoCommunityTokenChecked && (
          <>
            <Typography className={classes.address}>What is the address of the community token you would like to use?</Typography>
            <Typography>If your token is listed with Solana, you'll see a preview below.</Typography>

            {createdDaoToken.map((daoToken, index) => (
              <div key={index} className={classes.memberSide}>
                <div className={classes.members}>
                  <Typography>{`${index + 1}:`}</Typography>
                </div>
                <div className={classes.memberHashs}>
                  {daoToken} <img onClick={() => removeCreatedDaoTokens(index)} className={classes.removeIcon} src={remove} alt="remove icon" />
                </div>
              </div>
            ))}

            <TextField className={classes.textField} id="dao-members" label="e.g. DAO Community Token" variant="standard" onKeyDown={createNewDaoToken} />
          </>
        )}

        <div className={classes.generator}>
          <Typography className={classes.note}>Would you like to create DAO's community token</Typography>
          <Checkbox checked={daoCommunityTokenChecked} onChange={handleUseToken} />
        </div>

        {(createdDaoToken.length > 0 || choosenDaoTokenName) && daoCommunityTokenChecked && (
          <>
            <Typography className={classes.description}>What is the minimum number of community tokens needed to manage this DAO?</Typography>
            <Typography>A user will need at least this many community token to edit the DAO</Typography>

            <TextField type="number" className={classes.textField} defaultValue={1} id="dao-name" label="e.g. 1,000,000" variant="standard" onChange={handleMinNumberToEditDao} />
          </>
        )}
      </Grid>

      <Grid item xs={8} className={classes.mainItem}>
        <Typography className={classes.mainTitle}>Next, set your wallet's approval threshold.</Typography>
      </Grid>

      {(createdDaoToken.length > 0 || choosenDaoTokenName) && (
        <Grid item xs={8} className={`${classes.gridItem}, ${classes.card}`}>
          <Typography className={classes.description}>Adjust the percentage to determine votes needed to pass a proposal</Typography>

          <div className={classes.sliderSection}>
            <div className={classes.threshold}>{communityThreshold}%</div>
            0%
            <Slider className={classes.slider} defaultValue={60} aria-label="Default" valueLabelDisplay="off" onChange={handleCommunityThresholdRange} />
            100%
          </div>

          <div className={classes.percentageSection}>
            <Typography className={classes.percentageSectionText}>
              Approval Percentage <br />
              Typically, newer DAOs start their community approval quorums around 60% of total token supply.
            </Typography>
          </div>
        </Grid>
      )}
    </Grid>
  );
};

export default CommunityDaoToken;
