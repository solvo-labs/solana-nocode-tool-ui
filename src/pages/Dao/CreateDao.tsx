import { useEffect, useState } from "react";
import { Box, Button, Card, CardContent, Slider, Step, StepLabel, Stepper, TextField, Typography } from "@mui/material";
import remove from "../../assets/remove.png";
import { CustomButton } from "../../components/CustomButton";
import { DAO } from "../../lib/dao";
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";

export const CreateDao = () => {
  const [daoInstance, setDaoInstance] = useState<DAO>();
  const [activeStep, setActiveStep] = useState<number>(0);
  const [skipped, setSkipped] = useState(new Set<number>());
  const [multisign, setMultisign] = useState<boolean>(false);
  const [community, setCommunity] = useState<boolean>(false);
  const [DAONameInputText, setDAONameInputText] = useState<string>("");
  const [threshold, setThreshold] = useState<number>(0);
  const steps = ["Dao Category Selection", "DAO Info's", "Threshold", "Preview & confirm"];
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [publicKeys, setPublicKeys] = useState<string[]>([publicKey?.toBase58() || ""]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isStepOptional = (_step: number) => {
    return false;
  };

  const isStepSkipped = (step: number) => {
    return skipped.has(step);
  };

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      console.log("Create DAO function should be called here.");
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
      setSkipped((prevSkipped) => {
        const newSkipped = new Set(prevSkipped.values());
        newSkipped.delete(activeStep);
        return newSkipped;
      });
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSkip = () => {
    if (!isStepOptional(activeStep)) {
      throw new Error("You can't skip a step that isn't optional.");
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped((prevSkipped) => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });
  };

  const handleReset = () => {
    setActiveStep(0);
    setSkipped(new Set<number>());
  };

  const handleDAOName = (e: any) => {
    setDAONameInputText(e.target.value);
  };

  const handleDAOMembers = (e: any) => {
    if (e.code === "Enter") {
      setPublicKeys([...publicKeys, e.target.value]);
    }
  };

  const onBlurHandleDAOMembers = (e: any) => {
    if (e.code === "Enter") {
      setPublicKeys([...publicKeys, e.target.value]);
    }
  };

  const removeHash = (indexToRemove: number) => {
    setPublicKeys((prevHashArr) => {
      const updatedHashArr = [...prevHashArr];
      updatedHashArr.splice(indexToRemove, 1);
      return updatedHashArr;
    });
  };

  const handleThresholdRange = (e: any) => {
    setThreshold(e.target.value);
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

        const result = await daoInstance.createMultisigDao(publicKeyList, DAONameInputText, threshold);
        console.log("result", result);

        console.log(result);
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <div>
      <Box sx={{ width: "100%" }}>
        <Stepper activeStep={activeStep}>
          {steps.map((label, index) => {
            const stepProps: { completed?: boolean } = {};
            if (isStepSkipped(index)) {
              stepProps.completed = false;
            }
            return (
              <Step key={label} {...stepProps}>
                <StepLabel>{label}</StepLabel>
              </Step>
            );
          })}
        </Stepper>
        {activeStep === steps.length ? (
          <>
            <Typography sx={{ mt: 2, mb: 1 }}>All steps completed - you're finished</Typography>
            <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
              <Box sx={{ flex: "1 1 auto" }} />
              <Button onClick={handleReset}>Reset</Button>
            </Box>
          </>
        ) : (
          <>
            {activeStep === 0 && (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "50px", height: "300px", width: "100%" }}>
                <div>
                  <Card
                    onClick={() => {
                      setMultisign(true);
                      setCommunity(false);
                      handleNext();
                    }}
                    sx={{
                      borderRadius: "16px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      maxWidth: 420,
                      height: "200px",
                      cursor: "pointer",
                      boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
                      transition: "transform 0.2s",
                      "&:hover": { border: "1px solid #000", transform: "scale(1.05)" },
                    }}
                  >
                    <CardContent>
                      <Typography sx={{ fontSize: "20px", marginBottom: "10px", fontWeight: "600" }} variant="h6">
                        Multi-Signature Wallet
                      </Typography>
                      <Typography sx={{ fontSize: "18px" }}>A "multisig" is a shared wallet, typically with two or more members authorizing transactions.</Typography>
                    </CardContent>
                  </Card>
                </div>
                <div style={{ marginLeft: "50px" }}>
                  <Card
                    onClick={() => {
                      setMultisign(false);
                      setCommunity(true);
                      handleNext();
                    }}
                    sx={{
                      borderRadius: "16px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      maxWidth: 420,
                      height: "200px",
                      cursor: "pointer",
                      boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
                      transition: "transform 0.2s",
                      "&:hover": { border: "1px solid #000", transform: "scale(1.05)" },
                    }}
                  >
                    <CardContent>
                      <Typography sx={{ fontSize: "20px", marginBottom: "10px", fontWeight: "600" }} variant="h6">
                        Community Token DAO
                      </Typography>
                      <Typography sx={{ fontSize: "18px" }}>DAO members use a community token to denote their membership and allow them to vote on proposals.</Typography>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
            {activeStep === 1 && multisign === true && (
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start", padding: "50px", minHeight: "300px", width: "100%" }}>
                <div style={{ width: "100%" }}>
                  <Typography sx={{ fontSize: "40px", fontWeight: "600" }}>Let's get started</Typography>
                  <Typography sx={{ paddingTop: "20px", fontSize: "25px", fontWeight: "600" }}>What is the name of your wallet?</Typography>
                  <Typography>It's best to choose a descriptive, memorable name for you and your members.</Typography>
                </div>
                <div style={{ width: "100%", margin: "20px 0 20px 0" }}>
                  <TextField sx={{ width: "100%" }} id="dao-name" label="e.g. DAO Name" variant="standard" onChange={handleDAOName} />
                </div>
                {DAONameInputText && (
                  <div style={{ width: "100%" }}>
                    <div
                      style={{ padding: "20px 20px 20px 0", display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "flex-start", width: "100%" }}
                    >
                      <Typography sx={{ fontSize: "40px", fontWeight: "600" }}>
                        Next, invite members <br /> with their Solana Wallet Address.
                      </Typography>
                      <Typography sx={{ paddingTop: "20px", fontSize: "25px", fontWeight: "600" }}>Invite members {publicKeys.length}</Typography>
                      <Typography>Add Solana wallet addressses, separated by a comma or line-break.</Typography>
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "flex-start", width: "100%" }}>
                      <div>
                        {publicKeys.map((hash, index) => (
                          <div key={index} style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", marginBottom: "10px" }}>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                background: "linear-gradient(90deg, rgba(238,174,202,1) 0%, rgba(148,187,233,1) 100%)",
                                padding: "15px",
                                textAlign: "center",
                                borderRadius: "50%",
                                width: "20px",
                                height: "20px",
                                marginRight: "10px",
                              }}
                            >
                              <Typography>{index === 0 ? "Me:" : `${index + 1}:`}</Typography>
                            </div>
                            <div key={index} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                              {hash} <img onClick={() => removeHash(index)} style={{ width: "20px", marginLeft: "10px", cursor: "pointer" }} src={remove} alt="remove icon" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ width: "100%", margin: "20px 0 20px 0" }}>
                      <TextField sx={{ width: "100%" }} id="dao-members" label="e.g. hash" variant="standard" onKeyDown={handleDAOMembers} onBlur={onBlurHandleDAOMembers} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeStep === 1 && community === true && <div>Community adımın içeriği burada olacak.</div>}

            {activeStep === 2 && multisign === true && (
              <div style={{ padding: "50px 0", minHeight: "300px", width: "100%" }}>
                <div style={{ width: "100%" }}>
                  <Typography sx={{ fontSize: "40px", fontWeight: "600" }}>
                    Next, set your wallet's <br /> approval threshold.
                  </Typography>
                  <Typography sx={{ paddingTop: "20px" }}>Adjust the percentage to determine votes needed to pass a proposal</Typography>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: "20px",
                    padding: "30px",
                    background: "linear-gradient(45deg, rgba(42,229,157,1) 0%, rgba(168,103,253,1) 100%)",
                    borderRadius: "16px",
                    color: "black",
                  }}
                >
                  <div style={{ border: "1px solid #000", padding: "10px", margin: "10px", borderRadius: "8px", minWidth: "50px", textAlign: "center" }}>{threshold}%</div>
                  0%
                  <Slider
                    style={{ margin: "20px", height: "15px", color: "#47DDA5", width: "100%" }}
                    defaultValue={50}
                    aria-label="Default"
                    valueLabelDisplay="off"
                    onChange={(e) => handleThresholdRange(e)}
                  />
                  100%
                </div>
                <div style={{ marginTop: "20px", backgroundColor: "#3d3d3d", width: "100%", borderRadius: "16px" }}>
                  <Typography sx={{ padding: "20px" }}>
                    Member Percentage <br />
                    With <span style={{ color: "#43DAA5", fontWeight: "600" }}>{publicKeys.length}</span> members added to your wallet, <br />{" "}
                    <span style={{ color: "#43DAA5", fontWeight: "600" }}>{Math.ceil(threshold / (100 / publicKeys.length))}</span> members would need to approve a proposal for it
                    to pass.
                  </Typography>
                </div>
              </div>
            )}
            {activeStep === 3 && multisign === true && (
              <div style={{ padding: "50px 0", minHeight: "300px", width: "100%" }}>
                <div style={{ width: "100%" }}>
                  <Typography sx={{ fontSize: "40px", fontWeight: "600" }}>
                    Nearly done, let's check <br /> that things look right.
                  </Typography>
                </div>
                <div style={{ marginTop: "20px", backgroundColor: "#3d3d3d", width: "100%", borderRadius: "16px" }}>
                  <Typography sx={{ padding: "20px" }}>
                    DAO Name <br />
                    {DAONameInputText}
                  </Typography>
                </div>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "20px", width: "100%", borderRadius: "16px" }}>
                  <div style={{ marginTop: "20px", backgroundColor: "#3d3d3d", width: "50%", borderRadius: "16px" }}>
                    <Typography sx={{ padding: "20px" }}>
                      Invited members <br />
                      {publicKeys.length}
                    </Typography>
                  </div>
                  <div style={{ margin: "20px 0 0 10px", backgroundColor: "#3d3d3d", width: "50%", borderRadius: "16px" }}>
                    <Typography sx={{ padding: "20px" }}>
                      Approval threshold <br />
                      {threshold}
                    </Typography>
                  </div>
                </div>
                <div style={{ paddingTop: "40px", width: "100%", borderRadius: "16px", display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
                  <CustomButton label={"Create DAO"} disable={false} onClick={createDao} />
                </div>
              </div>
            )}
            <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
              <Button color="inherit" disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>
                Back
              </Button>
              <Box sx={{ flex: "1 1 auto" }} />
              {isStepOptional(activeStep) && (
                <Button color="inherit" onClick={handleSkip} sx={{ mr: 1 }}>
                  Skip
                </Button>
              )}
              <Button onClick={handleNext}>{activeStep === steps.length - 1 ? "Finish" : "Next"}</Button>
            </Box>
          </>
        )}
      </Box>
    </div>
  );
};
