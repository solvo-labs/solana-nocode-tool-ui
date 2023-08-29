import React from "react";
import { makeStyles } from "@mui/styles";
import { Theme } from "@mui/material";
import { CustomStep } from "./CustomStep";

const useStyles = makeStyles((theme: Theme) => ({
  appBar: {
    marginTop: "2rem",
    marginBottom: "1rem",
    width: "100%",
  },
  cardDiv: {
    marginTop: "8rem",
    display: "flex",
    alignItem: "center",
    justifyContent: "center",
  },
}));

type Props = {
  allSteps: string[];
  activeStep: number;
};

export const Steps: React.FC<Props> = ({ allSteps, activeStep }) => {
  const classes = useStyles();

  return (
    <div className={classes.appBar}>
      <CustomStep steps={allSteps} activeStep={activeStep} />
    </div>
  );
};
