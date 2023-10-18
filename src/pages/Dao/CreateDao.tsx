import { useEffect, useState } from "react";
import { Grid } from "@mui/material";
import { DAO } from "../../lib/dao";
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import DaoCreateCard from "../../components/DaoCreateCard";
import MultisignDaoDetails from "../../components/MultisignDaoDetails";
import { CustomButton } from "../../components/CustomButton";
import Threshold from "../../components/Threshold";
import PreviewDao from "../../components/PreviewDao";
import { makeStyles } from "@mui/styles";
import CommunityDaoDetails from "../../components/CommunityDaoDetails";
import CommunityDaoToken from "../../components/CommunityDaoToken";
import CommunityDaoCouncil from "../../components/CommunityDaoCouncil";
import DaoStepper from "../../components/DaoStepper";

const useStyles = makeStyles(() => ({
  gridContainer: {
    display: "flex !important",
    justifyContent: "center !important",
    alignItems: "flex-start !important",
    alignContent: "flex-start !important",
    padding: "16px !important",
    height: "100% !important",
  },
  grid: {
    display: "flex !important",
    justifyContent: "center !important",
    alignItems: "center !important",
    padding: "16px !important",
  },
  daoInfosCommunity: {
    display: "flex !important",
    flexDirection: "column",
    justifyContent: "center !important",
    alignItems: "center !important",
    padding: "16px !important",
  },
}));

export const CreateDao = () => {
  const classes = useStyles();

  const [daoInstance, setDaoInstance] = useState<DAO>();
  const [activeStep, setActiveStep] = useState<number>(0);
  const [multisign, setMultisign] = useState<boolean>(false);
  const [community, setCommunity] = useState<boolean>(false);
  const [daoName, setDaoName] = useState<string>("");
  const [communityDaoName, setCommunityDaoName] = useState<string>("");
  const [daoTokensForCommunity] = useState(["Oliver Hansen"]);
  const [choosenDaoTokenName, setChoosenDaoTokenName] = useState<string[]>([]);
  const [createdDaoToken, setCreatedDaoToken] = useState<any[]>([]);
  const [daoCouncilToken, setDaoCouncilToken] = useState<boolean>(false);
  const [daoCommunityTokenChecked, setDaoCommunityTokenChecked] = useState<boolean>(false);
  const [transferMintAuthChecked, setTransferMintAuthChecked] = useState<boolean>(false);
  const [threshold, setThreshold] = useState<number>(60);
  const [minNumberToEditDao, setMinNumberToEditDao] = useState<number>(1);
  const [communityThreshold, setCommunityThreshold] = useState<number>(60);
  const [afterCommunityThreshold, setAfterCommunityThreshold] = useState<number>(60);
  const [steps] = useState<string[]>(["Dao Category Selection", "DAO Info's", "Threshold", "Preview & confirm"]);
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [publicKeys, setPublicKeys] = useState<string[]>([publicKey?.toBase58() || ""]);
  const [councilMembers, setCouncilMembers] = useState<string[]>([publicKey?.toBase58() || ""]);

  const handleUseToken = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDaoCommunityTokenChecked(event.target.checked);
    if (!daoCommunityTokenChecked) {
      setChoosenDaoTokenName([]);
    }
  };

  const handleTransfer = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTransferMintAuthChecked(event.target.checked);
  };

  const handleChoosenDaoToken = (event: any) => {
    console.log("event.target.value", event.target.value);
    setChoosenDaoTokenName(event.target.value);
  };

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      console.log("Create DAO function should be called here.");
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }

    if (activeStep === 3) {
      createDao();
    }
  };

  const handleNextMultisign = () => {
    setMultisign(true);
    setCommunity(false);
    if (activeStep === steps.length - 1) {
      console.log("Create DAO function should be called here.");
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleNextCommunity = () => {
    setMultisign(false);
    setCommunity(true);
    if (activeStep === steps.length - 1) {
      console.log("Create DAO function should be called here.");
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleDAOName = (e: any) => {
    setDaoName(e.target.value);
  };

  const handleCommunityDaoName = (e: any) => {
    setCommunityDaoName(e.target.value.trim());
  };

  const createNewDaoToken = (e: any) => {
    if (e.code === "Enter") setCreatedDaoToken([...createdDaoToken, e.target.value]);
  };

  const handleDAOMembers = (e: any) => {
    if (e.target.value && e.code === "Enter") {
      setPublicKeys([...publicKeys, e.target.value]);
    }
  };

  const onBlurHandleDAOMembers = (e: any) => {
    if (e.target.value) {
      setPublicKeys([...publicKeys, e.target.value]);
    }
  };

  const handleCouncilMembers = (e: any) => {
    if (e.target.value && e.code === "Enter") {
      setCouncilMembers([...councilMembers, e.target.value]);
    }
  };

  const onBlurHandleCouncilMembers = (e: any) => {
    if (e.target.value && e.code === "Enter") {
      setCouncilMembers([...councilMembers, e.target.value]);
    }
  };

  const removeHash = (e: any) => {
    console.log("e", e);
    setPublicKeys((prevHashArr) => {
      const updatedHashArr = [...prevHashArr];
      updatedHashArr.splice(e, 1);
      return updatedHashArr;
    });
  };

  const removeCouncilMembers = (e: any) => {
    console.log("e", e);
    setCouncilMembers((prevCouncilMembers) => {
      const updatedCouncilMembers = [...prevCouncilMembers];
      updatedCouncilMembers.splice(e, 1);
      return updatedCouncilMembers;
    });
  };

  const removeCreatedDaoTokens = (e: any) => {
    console.log("e", e);
    setCreatedDaoToken((prevDaoTokens) => {
      const updatedDaoTokens = [...prevDaoTokens];
      updatedDaoTokens.splice(e, 1);
      return updatedDaoTokens;
    });
  };

  const handleThresholdRange = (e: any) => {
    setThreshold(e.target.value);
  };

  const handleAfterCommunityThresholdRange = (e: any) => {
    setAfterCommunityThreshold(e.target.value);
  };

  const handleCommunityThresholdRange = (e: any) => {
    setCommunityThreshold(e.target.value);
  };

  const handleDaoCouncilToken = () => {
    setDaoCouncilToken(!daoCouncilToken);
  };

  const handleMinNumberToEditDao = (e: any) => {
    setMinNumberToEditDao(e.target.value);
  };

  useEffect(() => {
    if (wallet) {
      const dao = new DAO(connection, wallet);
      setDaoInstance(dao);
    }
  }, [connection, wallet]);

  const createDao = async () => {
    if (daoInstance) {
      try {
        const publicKeyList = publicKeys.map((pk) => new PublicKey(pk));
        console.log("publicKeyList", publicKeyList);

        const result = await daoInstance.createMultisigDao(publicKeyList, daoName, threshold);
        console.log("result", result);

        console.log(result);
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <>
      <Grid container spacing={2} className={classes.gridContainer}>
        <Grid item xs={8} className={classes.grid}>
          <DaoStepper activeStep={activeStep} steps={steps} />
        </Grid>

        {activeStep === 0 && (
          <Grid item xs={8} className={classes.grid} style={{ minHeight: "350px !important" }}>
            <DaoCreateCard
              title={"Multi-Signature Wallet"}
              description={"A 'multisig' is a shared wallet, typically with two or more members authorizing transactions."}
              onClick={handleNextMultisign}
            />
            <DaoCreateCard
              title={"Community Token DAO"}
              description={"DAO members use a community token to denote their membership and allow them to vote on proposals."}
              onClick={handleNextCommunity}
            />
          </Grid>
        )}

        {activeStep === 1 && multisign === true && (
          <Grid item xs={8} className={classes.grid}>
            <MultisignDaoDetails
              onChange={handleDAOName}
              daoName={daoName}
              publicKeys={publicKeys}
              removeHash={removeHash}
              handleDAOMembers={handleDAOMembers}
              onBlur={onBlurHandleDAOMembers}
            />
          </Grid>
        )}

        {activeStep === 1 && community === true && (
          <Grid item xs={8} className={classes.daoInfosCommunity}>
            <CommunityDaoDetails onChange={handleCommunityDaoName} />

            {communityDaoName.trim().length > 0 && (
              <>
                <CommunityDaoToken
                  daoCommunityTokenChecked={daoCommunityTokenChecked}
                  handleUseToken={handleUseToken}
                  handleTransfer={handleTransfer}
                  createNewDaoToken={createNewDaoToken}
                  daoTokensForCommunity={daoTokensForCommunity}
                  choosenDaoTokenName={choosenDaoTokenName}
                  handleChoosenDaoToken={handleChoosenDaoToken}
                  createdDaoToken={createdDaoToken}
                  removeCreatedDaoTokens={removeCreatedDaoTokens}
                  handleCommunityThresholdRange={handleCommunityThresholdRange}
                  communityThreshold={communityThreshold}
                  handleMinNumberToEditDao={handleMinNumberToEditDao}
                  transferMintAuthChecked={transferMintAuthChecked}
                />

                <CommunityDaoCouncil
                  daoCouncilToken={daoCouncilToken}
                  handleDaoCouncilToken={handleDaoCouncilToken}
                  councilMembers={councilMembers}
                  removeCouncilMembers={removeCouncilMembers}
                  handleCouncilMembers={handleCouncilMembers}
                  onBlurHandleCouncilMembers={onBlurHandleCouncilMembers}
                />
              </>
            )}
          </Grid>
        )}

        {activeStep === 2 && multisign === true && (
          <Grid item xs={8} className={classes.grid}>
            <Threshold
              title={"Next, set your wallet's approval threshold."}
              description={"Adjust the percentage to determine votes needed to pass a proposal"}
              typeOfDao={"multisign"}
              threshold={threshold}
              onChange={handleThresholdRange}
              publicKeys={publicKeys}
            />
          </Grid>
        )}

        {activeStep === 2 && community === true && (
          <Grid item xs={8} className={classes.grid}>
            <Threshold
              title={"Next, set your DAO's council approval threshold."}
              description={"Adjust the percentage to determine votes needed to pass a proposal"}
              typeOfDao={"community"}
              threshold={afterCommunityThreshold}
              onChange={handleAfterCommunityThresholdRange}
              publicKeys={publicKeys}
            />
          </Grid>
        )}

        {activeStep === 3 && multisign === true && (
          <Grid item xs={8} className={classes.grid}>
            <PreviewDao typeOfDao={"multisign"} daoName={daoName} publicKeys={publicKeys} threshold={threshold} minNumberToEditDao={0} communityThreshold={0} />
          </Grid>
        )}

        {activeStep === 3 && community === true && (
          <Grid item xs={8} className={classes.grid}>
            <PreviewDao
              typeOfDao={"community"}
              daoName={communityDaoName}
              publicKeys={councilMembers}
              threshold={afterCommunityThreshold}
              communityThreshold={communityThreshold}
              minNumberToEditDao={minNumberToEditDao}
            />
          </Grid>
        )}

        {activeStep !== 0 && (
          <Grid item xs={8} className={classes.grid}>
            <Grid container spacing={2} className={classes.grid}>
              <Grid item xs={6} style={{ display: "flex", justifyContent: "flex-start" }}>
                <CustomButton label={"Back"} disable={activeStep === 0 ? true : false} onClick={handleBack} />
              </Grid>
              <Grid item xs={6} style={{ display: "flex", justifyContent: "flex-end" }}>
                <CustomButton
                  label={activeStep === steps.length - 1 && community ? "Create Community Token Dao" : activeStep === steps.length - 1 && multisign ? "CreateDao" : "Next"}
                  disable={false}
                  onClick={handleNext}
                />
              </Grid>
            </Grid>
          </Grid>
        )}
      </Grid>
    </>
  );
};
