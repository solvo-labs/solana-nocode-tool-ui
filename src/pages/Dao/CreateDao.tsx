import React, { useState } from "react";
import { Grid, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import DaoCategories from "../../components/Dao/DaoCategories";
import { Steps } from "../../components/DaoStep/Steps";
import { DAO_STEPS } from "../../utils/enum";
import { Category } from "../../utils/types";

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    padding: "2rem",
    [theme.breakpoints.up("sm")]: {
      minWidth: "30vw",
    },
    [theme.breakpoints.down("sm")]: {
      minWidth: "80vw",
    },
  },
  top: {
    position: "fixed",
    top: 100,
    left: 0,
    width: "100%",
    padding: "1rem 0rem",
    background: "#f4f4f5",
    color: "white",
  },
  // title: {
  //   textAlign: "center",
  //   background: "linear-gradient(to left, #aa66fe, #23ed98)",
  // },
  daoCategories: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "6rem",
    width: "100%",
  },
}));

const CreateDao: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<Category>({
    id: 0,
    label: "",
    icon: undefined,
  });

  const classes = useStyles();

  return (
    <Grid container className={classes.container} direction="column">
      <div className={classes.top}>
        {/* <Typography variant="h5" className={classes.title}>
          Create Dao
        </Typography> */}
        {/* <Divider sx={{ background: "#aa66fe" }} /> */}
        <Steps activeStep={activeStep} allSteps={Object.values(DAO_STEPS)} />
      </div>
      {activeStep === 1 && (
        <div className={classes.daoCategories}>
          <DaoCategories activeStepOnChange={setActiveStep} selectedCategoryOnChange={setSelectedCategory} selectedCategory={selectedCategory} />
        </div>
      )}
    </Grid>
  );
};

export default CreateDao;
