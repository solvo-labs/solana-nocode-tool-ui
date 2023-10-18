import { useEffect, useState } from "react";
import { Grid } from "@mui/material";
import { DAO } from "../../lib/dao";
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, sendAndConfirmRawTransaction } from "@solana/web3.js";
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
import { useNavigate } from "react-router-dom";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { fetchUserTokens } from "../../lib";
import { TokenData } from "../../utils/types";

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

const steps = ["Dao Category Selection", "DAO Info's", "Threshold", "Preview & confirm"];
const steps2 = ["Dao Category Selection", "Community DAO Info's", "Council Info's", "Preview & confirm"];

export const CreateDao = () => {
  const classes = useStyles();

  const [daoInstance, setDaoInstance] = useState<DAO>();
  const [activeStep, setActiveStep] = useState<number>(0);
  const [multisign, setMultisign] = useState<boolean>(false);
  const [community, setCommunity] = useState<boolean>(false);
  const [daoName, setDaoName] = useState<string>("");
  const [communityDaoName, setCommunityDaoName] = useState<string>("");
  const [daoTokensForCommunity, setDaoTokensForCommunity] = useState<TokenData[]>([]);
  const [choosenDaoTokenName, setChoosenDaoTokenName] = useState<string>();
  const [createdDaoToken, setCreatedDaoToken] = useState<any[]>([]);
  const [daoCouncilToken, setDaoCouncilToken] = useState<boolean>(false);
  const [daoCommunityTokenChecked, setDaoCommunityTokenChecked] = useState<boolean>(false);
  const [transferMintAuthChecked, setTransferMintAuthChecked] = useState<boolean>(false);
  const [threshold, setThreshold] = useState<number>(60);
  const [minNumberToEditDao, setMinNumberToEditDao] = useState<number>(1);
  const [communityThreshold, setCommunityThreshold] = useState<number>(60);
  const [afterCommunityThreshold, setAfterCommunityThreshold] = useState<number>(60);

  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [publicKeys, setPublicKeys] = useState<string[]>([publicKey?.toBase58() || ""]);
  const [councilMembers, setCouncilMembers] = useState<string[]>([publicKey?.toBase58() || ""]);
  const [councilTokenName, setCouncilTokenName] = useState<string>("");
  const [duration, setDuration] = useState<number>(3);
  // const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleUseToken = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDaoCommunityTokenChecked(event.target.checked);
    if (event.target.checked) {
      setDaoCouncilToken(true);
    }

    if (!daoCommunityTokenChecked) {
      setChoosenDaoTokenName(undefined);
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
      multisign ? createDao() : createCommunityDao();
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

    const init = async () => {
      if (publicKey) {
        const data = await fetchUserTokens(connection, publicKey);

        setDaoTokensForCommunity(data as any);
      }
    };

    init();
  }, [connection, publicKey, wallet]);

  const createDao = async () => {
    if (daoInstance) {
      try {
        const publicKeyList = publicKeys.map((pk) => new PublicKey(pk));

        const dao = await daoInstance.createDao(daoName, false, true, publicKeyList, "disabled", threshold, false, false, undefined, undefined, undefined, duration);

        const signedTx = await wallet!.signAllTransactions(dao.transaction);

        const transactionsSignatures: string[] = [];

        const {
          value: { blockhash, lastValidBlockHeight },
        } = await connection.getLatestBlockhashAndContext();

        for (const signed of signedTx) {
          const rawTransaction = signed.serialize();
          const transactionSignature = await sendAndConfirmRawTransaction(
            connection,
            rawTransaction,
            {
              signature: bs58.encode(signed.signature!),
              blockhash: blockhash,
              lastValidBlockHeight: lastValidBlockHeight,
            },
            {
              commitment: "confirmed",
            }
          );

          transactionsSignatures.push(transactionSignature);
        }

        navigate("/dao/" + dao.realmPk.toBase58());
      } catch (error) {
        console.log(error);
      }
    }
  };

  const createCommunityDao = async () => {
    if (daoInstance) {
      try {
        const dao = await daoInstance.createDao(
          communityDaoName,
          true,
          daoCouncilToken,
          daoCouncilToken ? councilMembers.map((pk) => new PublicKey(pk)) : [],
          communityThreshold,
          daoCouncilToken ? afterCommunityThreshold : "disabled",
          false,
          false,
          choosenDaoTokenName ? new PublicKey(choosenDaoTokenName) : undefined,
          councilTokenName ? new PublicKey(councilTokenName) : undefined,
          minNumberToEditDao,
          duration
        );

        const signedTx = await wallet!.signAllTransactions(dao.transaction);

        const transactionsSignatures: string[] = [];

        const {
          value: { blockhash, lastValidBlockHeight },
        } = await connection.getLatestBlockhashAndContext();

        for (const signed of signedTx) {
          const rawTransaction = signed.serialize();
          const transactionSignature = await sendAndConfirmRawTransaction(
            connection,
            rawTransaction,
            {
              signature: bs58.encode(signed.signature!),
              blockhash: blockhash,
              lastValidBlockHeight: lastValidBlockHeight,
            },
            {
              commitment: "confirmed",
            }
          );

          transactionsSignatures.push(transactionSignature);
        }

        navigate("/dao/" + dao.realmPk.toBase58());
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <>
      <Grid container spacing={2} className={classes.gridContainer}>
        <Grid item xs={8} className={classes.grid}>
          <DaoStepper activeStep={activeStep} steps={multisign ? steps : steps2} />
        </Grid>

        {activeStep === 0 && (
          <Grid item xs={8} className={classes.grid} style={{ minHeight: "350px !important" }}>
            <DaoCreateCard
              title={"Multi-Signature Wallet"}
              description={"A 'multisig' represents a jointly managed wallet where transactions require the approval of at least two or more participants."}
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
              duration={duration}
              handleDuration={(e) => setDuration(e)}
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
                  choosenDaoTokenName={choosenDaoTokenName || ""}
                  handleChoosenDaoToken={handleChoosenDaoToken}
                  createdDaoToken={createdDaoToken}
                  removeCreatedDaoTokens={removeCreatedDaoTokens}
                  handleCommunityThresholdRange={handleCommunityThresholdRange}
                  communityThreshold={communityThreshold}
                  handleMinNumberToEditDao={handleMinNumberToEditDao}
                  transferMintAuthChecked={transferMintAuthChecked}
                  duration={duration}
                  handleDuration={(e) => setDuration(e)}
                />
              </>
            )}
          </Grid>
        )}

        {activeStep === 2 && multisign === true && (
          <Grid item xs={8} className={classes.grid}>
            <Threshold
              title={"Following that, establish the approval threshold for your wallet"}
              description={"Modify the percentage to define the required votes for proposal approval"}
              typeOfDao={"multisign"}
              threshold={threshold}
              onChange={handleThresholdRange}
              publicKeys={publicKeys}
            />
          </Grid>
        )}

        {activeStep === 2 && community === true && (
          <Grid item xs={8} className={classes.daoInfosCommunity}>
            <CommunityDaoCouncil
              daoCouncilToken={daoCouncilToken}
              handleDaoCouncilToken={handleDaoCouncilToken}
              councilMembers={councilMembers}
              removeCouncilMembers={removeCouncilMembers}
              handleCouncilMembers={handleCouncilMembers}
              onBlurHandleCouncilMembers={onBlurHandleCouncilMembers}
              councilTokenName={councilTokenName}
              onChangeCouncilTokenName={(e: any) => {
                setCouncilTokenName(e);
              }}
            />
            {daoCouncilToken && (
              <Threshold
                title={"Determine the threshold for your Council Token."}
                description={""}
                typeOfDao={"community"}
                threshold={afterCommunityThreshold}
                onChange={handleAfterCommunityThresholdRange}
                publicKeys={publicKeys}
              />
            )}
          </Grid>
        )}

        {activeStep === 3 && multisign === true && (
          <Grid item xs={8} className={classes.grid}>
            <PreviewDao
              typeOfDao={"multisign"}
              daoName={daoName}
              publicKeys={publicKeys}
              threshold={threshold}
              minNumberToEditDao={0}
              communityThreshold={0}
              daoCouncilToken={true}
            />
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
              communityToken={choosenDaoTokenName}
              daoCouncilToken={daoCouncilToken}
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
                  label={activeStep === steps.length - 1 && community ? "Create Community Token Dao" : activeStep === steps.length - 1 && multisign ? "Create Dao" : "Next"}
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
