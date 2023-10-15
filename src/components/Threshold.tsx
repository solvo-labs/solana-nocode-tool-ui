import React from "react";
import { Grid, Slider, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles(() => ({
  gridContainer: {
    justifyContent: "center !important",
    padding: "16px !important",
  },
  title: {
    fontSize: "40px !important",
    fontWeight: "600 !important",
    marginBottom: "20px !important",
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
}));

interface ThresholdProps {
  threshold: number;
  onChange: (e: any) => void;
  publicKeys: string[];
  title: string;
  description: string;
  typeOfDao: string;
}

const Threshold: React.FC<ThresholdProps> = ({ threshold, onChange, publicKeys, title, description, typeOfDao }) => {
  const classes = useStyles();

  return (
    <Grid container spacing={2} className={classes.gridContainer}>
      <Grid item xs={8}>
        <Typography className={classes.title}> {title} </Typography>
        <Typography>{description}</Typography>
      </Grid>

      <Grid item xs={8}>
        <div className={classes.sliderSection}>
          <div className={classes.threshold}>{threshold}%</div>
          0%
          <Slider className={classes.slider} defaultValue={60} aria-label="Default" valueLabelDisplay="off" onChange={onChange} />
          100%
        </div>
      </Grid>

      <Grid item xs={8}>
        <div className={classes.percentageSection}>
          <Typography className={classes.percentageSectionText}>
            Member Percentage <br />
            With <span className={classes.percentageSectionNumber}>{publicKeys.length}</span> members added to your {typeOfDao === "multisign" ? "wallet" : "dao"} <br />
            <span className={classes.percentageSectionNumber}>{Math.ceil(threshold / (100 / publicKeys.length))}</span> members would need to approve a proposal for it to pass.
          </Typography>
        </div>
      </Grid>
    </Grid>
  );
};

export default Threshold;
