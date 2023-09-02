import React, { useState } from "react";
import { Grid } from "@mui/material";
import { makeStyles } from "@mui/styles";
import DaoCategories from "../../components/Dao/DaoCategories";
import { Steps } from "../../components/DaoStep/Steps";
import { DAO_STEPS, TOKEN_TYPES } from "../../utils/enum";
import { Category, Dao, TokenWithType } from "../../utils/types";
import { DaoInfo } from "../../components/Dao/DaoInfo";
import { CustomButton } from "../../components/Custom/CustomButton";
import TokenDetail from "../../components/Dao/TokenDetail";
import { useWallet } from "@solana/wallet-adapter-react";

const CreateDao: React.FC = () => {
  const { publicKey } = useWallet();

  const [activeStep, setActiveStep] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<Category>({
    id: 0,
    label: "",
    icon: undefined,
  });
  const [dao, setDao] = useState<Dao>({
    name: "",
    description: "",
  });
  const [token, setToken] = useState<TokenWithType>({
    type: TOKEN_TYPES.NEW_TOKEN,
    name: "",
    symbol: "",
    amount: 0,
    decimal: 8,
    freezeAuthority: publicKey?.toBase58(),
    authority: publicKey?.toBase58(),
  });
  const [disableButton, setDisableButton] = useState<boolean>(false);

  const useStyles = makeStyles(() => ({
    container: {
      background: "#f4f4f5",
      marginTop: activeStep !== 1 ? "5rem" : "0",
      padding: activeStep !== 1 ? "0" : "2rem",
      paddingRight: activeStep !== 1 ? "3.2rem" : "2rem",
      borderRadius: "0.5rem",
    },
    top: {
      position: "fixed",
      top: 100,
      left: 0,
      width: "100%",
      background: activeStep !== 1 ? "" : "#f4f4f5",
      color: "white",
    },
    // title: {
    //   textAlign: "center",
    //   background: "linear-gradient(to left, #aa66fe, #23ed98)",
    // },
    buttonContainer: {
      display: "flex",
      width: "100%",
      borderBottom: "3px solid #5719A3",
      borderLeft: "3px solid #5719A3",
      borderRight: "3px solid #5719A3",
      borderBottomLeftRadius: "5px",
      borderBottomRightRadius: "5px",
      padding: "0 1.5rem 1.5rem 1.5rem",
      //background: "linear-gradient(to left, #aa66fe, #23ed98)",
    },
    daoCategories: {
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      alignItems: "center",
      marginTop: "5rem",
      marginBottom: "1rem",
      width: "100%",
    },
    daoInfo: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      borderTop: "3px solid #5719A3",
      borderLeft: "3px solid #5719A3",
      borderRight: "3px solid #5719A3",
      borderTopLeftRadius: "5px",
      borderTopRightRadius: "5px",
      padding: "1.5rem",
      //background: "linear-gradient(to left, #aa66fe, #23ed98)",
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
          <DaoInfo daoOnChange={setDao} dao={dao} disableButtonOnChange={setDisableButton} />
        </div>
      )}

      {activeStep === 3 && (
        <div className={classes.daoInfo}>
          <TokenDetail tokenDetailOnChange={setToken} tokenDetail={token} />
        </div>
      )}

      {activeStep !== 1 ? (
        <div className={classes.buttonContainer}>
          <Grid paddingTop={2} container justifyContent={"space-evenly"} width={"100%"}>
            <CustomButton onClick={() => setActiveStep(activeStep - 1)} disable={false} label="BACK" />
            {activeStep !== 4 ? (
              <CustomButton onClick={() => setActiveStep(activeStep + 1)} disable={disableButton} label="NEXT" />
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
