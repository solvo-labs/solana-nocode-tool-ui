import React from "react";
import { Step, StepLabel, Stepper } from "@mui/material";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles(() => ({
  stepLabel: {
    fontSize: "20px",
  },
}));

interface DaoStepperProps {
  steps: string[];
  activeStep: number;
}

const DaoStepper: React.FC<DaoStepperProps> = ({ steps, activeStep }) => {
  const classes = useStyles();

  return (
    <Stepper style={{ padding: "100px 0 40px 0" }} activeStep={activeStep}>
      {steps.map((label) => {
        const stepProps: { completed?: boolean } = {};
        return (
          <Step style={{ fontSize: "20px !important" }} key={label} {...stepProps}>
            <StepLabel classes={{ label: classes.stepLabel }}>{label}</StepLabel>
          </Step>
        );
      })}
    </Stepper>
  );
};

export default DaoStepper;
