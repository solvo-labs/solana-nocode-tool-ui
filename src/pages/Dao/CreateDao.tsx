import React, { useState } from "react";
import { Grid, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import DaoCategories from "../../components/Dao/DaoCategories";
import { Steps } from "../../components/DaoStep/Steps";
import { DAO_STEPS } from "../../utils/enum";
import { Category, Dao } from "../../utils/types";
import { DaoInfo } from "../../components/Dao/DaoInfo";
import { CustomButton } from "../../components/CustomButton";

const CreateDao: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<Category>({
    id: 0,
    label: "",
    icon: undefined,
  });
  const [dao, setDao] = useState<Dao>({
    name: "",
    description: "",
    image: "",
  });

  const useStyles = makeStyles((theme: Theme) => ({
    container: {
      padding: "2rem 2rem 3rem 2rem",
      background: activeStep === 2 ? "" : "#f4f4f5",
      borderRadius: "5px",
      marginTop: activeStep === 2 ? "6.5rem" : "0",
    },
    top: {
      position: "fixed",
      top: 100,
      left: 0,
      width: "100%",
      padding: "1rem 0rem",
      background: activeStep === 2 ? "" : "#f4f4f5",
      color: "white",
    },
    // title: {
    //   textAlign: "center",
    //   background: "linear-gradient(to left, #aa66fe, #23ed98)",
    // },
    buttonContainer: {
      display: "flex",
      marginTop: "1rem",
      width: "100%",
    },
    daoCategories: {
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      alignItems: "center",
      marginTop: "6rem",
      width: "100%",
    },
    daoInfo: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
    },
  }));

  const classes = useStyles();

  const createDao = () => {
    console.log("create dao");
  };

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

      {activeStep === 2 && (
        <div className={classes.daoInfo}>
          <DaoInfo />
        </div>
      )}

      {activeStep !== 1 ? (
        <div className={classes.buttonContainer}>
          <Grid paddingTop={2} container justifyContent={"space-evenly"} width={"100%"}>
            <CustomButton onClick={() => setActiveStep(activeStep - 1)} disable={false} label="BACK" />
            {activeStep !== 4 ? (
              <CustomButton onClick={() => setActiveStep(activeStep + 1)} disable={false} label="NEXT" />
            ) : (
              <CustomButton onClick={createDao} disable={false} label="SAVE" />
            )}
          </Grid>
        </div>
      ) : undefined}
    </Grid>
  );
};

export default CreateDao;
