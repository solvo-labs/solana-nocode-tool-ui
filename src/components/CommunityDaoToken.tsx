import React from "react";
import { FormControl, Grid, InputLabel, MenuItem, OutlinedInput, Select, Slider, TextField, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import Checkbox from "@mui/material/Checkbox";
// import remove from "../assets/remove.png";
import { TokenData } from "../utils/types";

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
    fontSize: "2rem !important",
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
  mt: {
    marginTop: "2rem",
  },
}));

interface CommunityDaoTokenProps {
  daoTokensForCommunity: TokenData[];
  choosenDaoTokenName: string;
  createdDaoToken: string[];
  daoCommunityTokenChecked: boolean;
  transferMintAuthChecked: boolean;
  duration: number;
  handleTransfer: (e: any) => void;
  handleUseToken: (e: any) => void;
  createNewDaoToken: (e: any) => void;
  handleChoosenDaoToken: (e: any) => void;
  removeCreatedDaoTokens: (e: any) => void;
  handleCommunityThresholdRange: (e: any) => void;
  handleMinNumberToEditDao: (e: any) => void;
  communityThreshold: number;
  handleDuration: (drt: number) => void;
}

const CommunityDaoToken: React.FC<CommunityDaoTokenProps> = ({
  daoCommunityTokenChecked,
  // transferMintAuthChecked,
  duration,
  handleUseToken,
  // createNewDaoToken,
  daoTokensForCommunity,
  choosenDaoTokenName,
  handleChoosenDaoToken,
  // createdDaoToken,
  // removeCreatedDaoTokens,
  handleCommunityThresholdRange,
  communityThreshold,
  handleMinNumberToEditDao,
  // handleTransfer,
  handleDuration,
}) => {
  const classes = useStyles();
  const defaultValue = "DAY";

  return (
    <Grid container spacing={2} className={classes.gridContainer}>
      <Grid item xs={8} className={classes.mainItem}>
        <Typography className={classes.mainTitle}>DAO’s community token</Typography>
      </Grid>

      <Grid item xs={8} className={`${classes.gridItem}, ${classes.card}`}>
        <div className={classes.generator}>
          <Typography className={classes.note}>Would you like to create DAO's community token</Typography>
          <Checkbox checked={daoCommunityTokenChecked} onChange={handleUseToken} />
        </div>
        <Typography className={classes.description}>Do you have an existing token for your DAO's community?</Typography>

        <FormControl fullWidth disabled={daoCommunityTokenChecked ? true : false} className={classes.formControl}>
          <InputLabel id="demo-simple-select-label">Tokens</InputLabel>
          <Select labelId="demo-simple-select-label" id="demo-simple-select" value={choosenDaoTokenName} onChange={handleChoosenDaoToken} input={<OutlinedInput label="Tokens" />}>
            {daoTokensForCommunity.map((tk, index) => (
              <MenuItem key={index} value={tk.hex}>
                {tk.metadata.name + "(" + tk.metadata.symbol + ")"}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* {!daoCommunityTokenChecked && (
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
        )} */}

        {/* <div className={classes.generator}>
          <Typography className={classes.note}>Do you want to transfer mint authority of the token to the DAO?</Typography>
          <Checkbox checked={transferMintAuthChecked} onChange={handleTransfer} />
        </div> */}

        <Typography className={classes.description}>Minimum number of community tokens required for overseeing this DAO?</Typography>

        <TextField type="number" className={classes.textField} defaultValue={1} id="dao-name" label="e.g. 1,000,000" variant="standard" onChange={handleMinNumberToEditDao} />
        <Typography className={classes.description}>Proposal time</Typography>

        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
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

        {/* <FormControl fullWidth>
          <InputLabel id="selectLabel">Durations</InputLabel>
          <Select
            value={vestParams.selectedDuration.toString()}
            label="Durations"
            onChange={(e: SelectChangeEvent<string>) => {
              setVestParams({ ...vestParams, selectedDuration: Number(e.target.value) });
            }}
            className={classes.input}
            id={"durations"}
          >
            {Object.keys(Durations).map((tk) => {
              return (
                <MenuItem key={tk} value={Durations[tk as keyof DurationsType]}>
                  {tk}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl> */}
      </Grid>

      <Grid item xs={8} className={`${classes.gridItem}, ${classes.card} ,  ${classes.mt}`}>
        <Typography className={classes.description}>Determine the threshold for your Community Token.</Typography>

        <div className={classes.sliderSection}>
          <div className={classes.threshold}>{communityThreshold}%</div>
          0%
          <Slider className={classes.slider} defaultValue={60} aria-label="Default" valueLabelDisplay="off" onChange={handleCommunityThresholdRange} />
          100%
        </div>
      </Grid>
    </Grid>
  );
};

export default CommunityDaoToken;
