/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  List,
  ListItemText,
  Modal,
  Stack,
  Switch,
  Tab,
  Theme,
  Typography,
} from "@mui/material";
import SearchInput from "../../components/SearchInput.tsx";
import { DAO_TYPE, FILTERS } from "../../utils/enum.ts";
import FilterSelector from "../../components/FilterSelector.tsx";
import { makeStyles } from "@mui/styles";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import SettingsIcon from "@mui/icons-material/Settings";
import { DAO } from "../../lib/dao";
import toastr from "toastr";
import { useParams } from "react-router-dom";
import { PublicKey, RpcResponseAndContext, TokenAmount, Transaction } from "@solana/web3.js";
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import MembersModal from "../../components/MembersModal.tsx";
import { formatTimestamp, sleep } from "../../lib/utils.ts";
import { Governance, ProgramAccount, Proposal, ProposalState, Realm, TokenOwnerRecord, VoteThresholdType, VoteTypeKind } from "@solana/spl-governance";
import ExecutableProposalCard from "../../components/ProposalComponent/ExecutableProposalCard.tsx";
import NonExecutableProposalCard from "../../components/ProposalComponent/NonExecutableProposalCard.tsx";
import ConcludedProposal from "../../components/ProposalComponent/ConcludedProposal.tsx";
import { CustomInput } from "../../components/CustomInput.tsx";
import DeleteIcon from "@mui/icons-material/Delete";
import { GOVERNANCE_PROGRAM_ID } from "../../lib/dao/constants.ts";
import { fetchUserTokens } from "../../lib/index.ts";
import DaoGovernancePower from "../../components/DaoGovernancePower.tsx";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useStyles = makeStyles((theme: Theme) => ({
  card: {
    borderRadius: "12px !important",
    width: "100%",
    maxHeight: "30rem",
  },
  cardContent: {
    padding: "1.5rem !important",
  },
  managementItems: {
    height: "40px",
    display: "flex",
    alignItems: "center",
    paddingLeft: "1rem",
    paddingRight: "1rem",
    "&:hover": {
      backgroundColor: "rgba(0,255,108,0.2)",
      borderRadius: "8px !important",
      cursor: "pointer",
    },
  },
  detailItems: {
    paddingLeft: "1rem",
    paddingRight: "1rem",
  },
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2),
    position: "relative", // Modal içeriği için göreceli konumlandırma
  },
}));

const DaoDetails: React.FC = () => {
  const classes = useStyles();
  const [loading, setLoading] = useState<boolean>(true);
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const [daoInstance, setDaoInstance] = useState<DAO>();
  const params = useParams();
  const pubkey = params.pubkey;

  const [dao, setDao] = useState<ProgramAccount<Realm>>();
  const [members, setMembers] = useState<ProgramAccount<TokenOwnerRecord>[]>([]);
  const [proposals, setProposals] = useState<ProgramAccount<Proposal>[]>();

  const [daoType, setDaoType] = useState<DAO_TYPE>();

  const [selectedFilter, setSelectedFilter] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [searchedProposal, setSearchedProposal] = useState<any[]>([]);
  const [filtersTitle] = useState<FILTERS[]>(Object.values(FILTERS));
  const [showCreateProposalModal, setShowCreateProposalModal] = useState<boolean>(false);
  const [proposalData, setProposalData] = useState<{ name: string; description: string; isMulti: boolean; options: string[] }>({
    name: "",
    description: "",
    isMulti: false,
    options: [],
  });
  const [daoConfig, setDaoConfig] = useState<Governance>();
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [token, setToken] = useState<RpcResponseAndContext<TokenAmount>>();
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [showDepositModal, setShowDepositModal] = useState<boolean>(false);

  const { sendTransaction, publicKey } = useWallet();

  const [membersOpen, setMembersOpen] = useState(false);
  const handleOpen = (setState: any) => setState(true);
  const handleClose = (setState: any) => setState(false);

  const searchFlag = useMemo(() => {
    return search != "";
  }, [search]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    console.log(inputValue);
    setSearch(inputValue);
    if (proposals) {
      const filtered = proposals.filter((proposal) => proposal.account.name.toLowerCase().includes(inputValue.toLowerCase()));
      setSearchedProposal(filtered);
    }
  };

  const [tabValue, setTabValue] = useState<string>("1");
  const [amIMember, setAmIMember] = useState<boolean>(true);

  // @ts-ignore
  const handleChangeTabs = (event: React.SyntheticEvent, newValue: number) => {
    // @ts-ignore
    setTabValue(newValue);
  };

  useEffect(() => {
    if (wallet && pubkey) {
      const dao = new DAO(connection, wallet, new PublicKey(pubkey));

      setDaoInstance(dao);
    }
  }, [connection, pubkey, wallet]);

  useEffect(() => {
    const init = async () => {
      if (daoInstance && pubkey && publicKey) {
        try {
          const daoDetail = await daoInstance.getDaoDetails();
          await sleep(3000);

          const userTokenDetails = await fetchUserTokens(connection, publicKey, daoDetail.dao.account.communityMint);
          const members = await daoInstance.getMembers();

          await sleep(3000);

          const imAMember = members.findIndex((mm) => mm.account.governingTokenOwner.toBase58() === publicKey.toBase58()) > -1;
          const tokenSupply = await connection.getTokenSupply(daoDetail.dao.account.communityMint);
          setToken(tokenSupply);

          if (!imAMember && userTokenDetails.length === 0) {
            toastr.warning("You'r not a member for this dao");
            setAmIMember(false);
          }

          await sleep(3000);

          const proposals = await daoInstance.getProposals();

          if (
            daoDetail.config?.config.councilVoteThreshold.type == VoteThresholdType.Disabled &&
            daoDetail.config?.config.councilVetoVoteThreshold.type == VoteThresholdType.Disabled
          ) {
            setDaoType(DAO_TYPE.COMMUNITY);
          } else {
            setDaoType(DAO_TYPE.MULTI_SIGNATURE);
          }

          setProposals(proposals);
          setMembers(members);
          setDao(daoDetail.dao);
          setDaoConfig(daoDetail.config);

          setLoading(false);
        } catch (error) {
          console.log(error);
          toastr.error("someting went wrong");
        }
      }
    };
    init();
  }, [connection, daoInstance, pubkey, publicKey]);

  const createProposal = async () => {
    setLoading(true);
    try {
      const tx = await daoInstance?.createProposal(proposalData.name, proposalData.description, proposalData.isMulti, proposalData.isMulti ? proposalData.options : undefined);

      const transactionProposal = new Transaction();

      transactionProposal.add(tx![0].instructionsSet[0].transactionInstruction);
      transactionProposal.add(tx![0].instructionsSet[1].transactionInstruction);
      transactionProposal.add(tx![1].instructionsSet[0].transactionInstruction);

      const {
        context: { slot: minContextSlot },
        value: { blockhash, lastValidBlockHeight },
      } = await connection.getLatestBlockhashAndContext();

      const signature = await sendTransaction(transactionProposal!, connection, { minContextSlot, signers: [] });
      await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature: signature });
      setLoading(false);
      setShowCreateProposalModal(false);
      setProposalData({ name: "", description: "", isMulti: false, options: [] });
      toastr.success("Proposal created successfully.");
    } catch (error) {
      setLoading(false);
      setShowCreateProposalModal(false);
      toastr.error("Proposal could not be created. Error: " + error);
    }
  };

  const deposit = async () => {
    if (daoInstance && dao) {
      setLoading(true);
      const depositAction = await daoInstance.depositCommunityToken(dao, depositAmount * Math.pow(10, token?.value.decimals || 0));

      const {
        context: { slot: minContextSlot },
        value: { blockhash, lastValidBlockHeight },
      } = await connection.getLatestBlockhashAndContext();

      const signature = await sendTransaction(depositAction.transaction, connection, { minContextSlot, signers: depositAction.signers });
      await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature: signature });
      setLoading(false);
      toastr.success("Deposit completed successfully");
      setShowDepositModal(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
        }}
      >
        <CircularProgress />
      </div>
    );
  }

  const depositModal = () => {
    return (
      <Modal
        className={classes.modal}
        open={showDepositModal}
        onClose={() => {
          setShowDepositModal(false);
        }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            borderRadius: "8px",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 500,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            maxHeight: 600,
            height: "auto",
            p: 1,
            overflowY: "auto",
          }}
        >
          <div className={classes.modalContent}>
            <Typography id="modal-modal-title" variant="h6" component="h2" color={"black"} align="center" marginBottom={"1rem"}>
              Deposit / Withdraw Community Token
            </Typography>
            <Divider sx={{ marginBottom: "1rem", marginTop: "0.5rem", background: "black" }} />
            <Box sx={{ width: "100%", color: "black" }}>
              <Grid gap={2} style={{ display: "flex", flexDirection: "column" }}>
                <CustomInput
                  placeHolder="Amount"
                  label="Amount"
                  id="amount"
                  name="amount"
                  type="text"
                  value={depositAmount}
                  onChange={(e: any) => setDepositAmount(e.target.value)}
                  disable={false}
                />
                <Button variant="outlined" onClick={deposit}>
                  Deposit
                </Button>
              </Grid>
            </Box>
            <Divider />
          </div>
        </Box>
      </Modal>
    );
  };

  const daoConfigModal = () => {
    if (daoConfig) {
      return (
        <Modal
          className={classes.modal}
          open={showConfigModal}
          onClose={() => {
            setShowConfigModal(false);
          }}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box
            sx={{
              borderRadius: "8px",
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 500,
              bgcolor: "background.paper",
              border: "2px solid #000",
              boxShadow: 24,
              maxHeight: 600,
              height: "auto",
              p: 1,
              overflowY: "auto",
            }}
          >
            <div className={classes.modalContent}>
              <Typography id="modal-modal-title" variant="h6" component="h2" color={"black"} align="center" marginBottom={"1rem"}>
                Dao Config Parameters
              </Typography>
              <Divider sx={{ marginBottom: "1rem", marginTop: "0.5rem", background: "black" }} />
              <Box sx={{ width: "100%", color: "black" }}>
                <List>
                  <ListItemText>
                    <b>Max Voting Time : </b> {formatTimestamp(daoConfig.config.baseVotingTime - daoConfig.config.votingCoolOffTime)}
                  </ListItemText>
                  <ListItemText>
                    <b>Proposal Cool-off Time : </b> {formatTimestamp(daoConfig.config.votingCoolOffTime)}
                  </ListItemText>
                  <ListItemText>
                    <b>Deposit Exempt Proposal Count : </b> {daoConfig.config.depositExemptProposalCount}
                  </ListItemText>
                  <ListItemText>
                    <b>Community Vote Threshold Percentage : </b> %{daoConfig.config.communityVoteThreshold.value || 0}
                  </ListItemText>
                  <ListItemText>
                    <b>Council Vote Threshold Percentage : </b> %{daoConfig.config.councilVoteThreshold.value || 0}
                  </ListItemText>
                  {/* <ListItemText>
                    <b>Min community tokens to create governance : </b> {daoConfig.config.minCommunityTokensToCreateProposal.toNumber()}
                  </ListItemText> */}
                  {/* <ListItemText>
                    <b>Min council tokens to create governance : </b> {daoConfig.config.minCouncilTokensToCreateProposal.toNumber()}
                  </ListItemText> */}
                </List>
              </Box>
              <Divider />
            </div>
          </Box>
        </Modal>
      );
    }
  };

  const createProposalModal = () => {
    return (
      <Modal
        className={classes.modal}
        open={showCreateProposalModal}
        onClose={() => {
          setShowCreateProposalModal(false);
        }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            borderRadius: "8px",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 500,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            maxHeight: 600,
            height: "auto",
            p: 1,
            overflowY: "auto",
          }}
        >
          <div className={classes.modalContent}>
            <Typography id="modal-modal-title" variant="h6" component="h2" color={"black"} align="center" marginBottom={"1rem"}>
              Create Proposal
            </Typography>
            <Typography id="modal-modal-title" variant="subtitle1" component="h2" color={"black"} align="center">
              Fill the form for create new proposal
            </Typography>
            <Divider sx={{ marginBottom: "1rem", marginTop: "0.5rem", background: "black" }} />
            <Grid gap={2} style={{ display: "flex", flexDirection: "column" }}>
              <CustomInput
                placeHolder="Title"
                label="Title"
                id="name"
                name="name"
                type="text"
                value={proposalData.name || ""}
                onChange={(e: any) => setProposalData({ ...proposalData, name: e.target.value })}
                disable={false}
              />
              <CustomInput
                placeHolder="Description"
                label="Description"
                id="description"
                name="description"
                type="text"
                value={proposalData.description || ""}
                onChange={(e: any) => setProposalData({ ...proposalData, description: e.target.value })}
                disable={false}
              />
              <FormControlLabel
                control={<Switch checked={proposalData.isMulti} onChange={() => setProposalData({ ...proposalData, isMulti: !proposalData.isMulti })} />}
                label="Multi Choice (Non Executable)"
                style={{ color: "black" }}
              />
              {proposalData.isMulti && (
                <>
                  <CustomInput
                    placeHolder="Option-1"
                    label="Option-1"
                    id="option1"
                    name="option1"
                    type="text"
                    value={proposalData.options[0] || ""}
                    onChange={(e: any) => {
                      const clonedState = { ...proposalData };
                      clonedState.options[0] = e.target.value;

                      setProposalData(clonedState);
                    }}
                    disable={false}
                  />
                  <CustomInput
                    placeHolder="Option-2"
                    label="Option-2"
                    id="option2"
                    name="option2"
                    type="text"
                    value={proposalData.options[1] || ""}
                    onChange={(e: any) => {
                      const clonedState = { ...proposalData };
                      clonedState.options[1] = e.target.value;

                      setProposalData(clonedState);
                    }}
                    disable={false}
                  />
                  {proposalData.options.slice(2).map((_pd: any, index: number) => {
                    return (
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <CustomInput
                          placeHolder={"option-" + (index + 3)}
                          label={"option-" + (index + 3)}
                          id={"option-" + (index + 3)}
                          name={"option-" + (index + 3)}
                          type="text"
                          value={proposalData.options[index + 2] || ""}
                          onChange={(e: any) => {
                            const clonedState = { ...proposalData };
                            clonedState.options[index + 2] = e.target.value;

                            setProposalData(clonedState);
                          }}
                          disable={false}
                        />
                        <IconButton
                          onClick={() => {
                            const clonedState = { ...proposalData };
                            clonedState.options.splice(index + 2, 1);
                            setProposalData(clonedState);
                          }}
                        >
                          {<DeleteIcon />}
                        </IconButton>
                      </div>
                    );
                  })}
                  <Button
                    variant="outlined"
                    onClick={() => {
                      const clonedState = { ...proposalData };
                      clonedState.options.push("");
                      setProposalData(clonedState);
                    }}
                  >
                    + Add Option
                  </Button>
                </>
              )}
              {amIMember && (
                <Button variant="outlined" onClick={createProposal}>
                  Create Proposal
                </Button>
              )}
            </Grid>
            <Divider />
          </div>
        </Box>
      </Modal>
    );
  };

  return (
    <Grid container direction={"row"} spacing={2} width={"90vw"} display={"flex"} alignContent={"center"}>
      <Grid item xl={4} lg={4} md={4} sm={4} xs={12}>
        <Stack spacing={2}>
          <Card className={classes.card}>
            <CardContent className={classes.cardContent}>
              <Stack direction={"row"} spacing={2} alignItems={"center"}>
                <Avatar
                  alt="dao-name"
                  src="data:image/png;base64,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"
                >
                  Logo
                </Avatar>
                <Typography variant={"h6"}>{!dao ? "undefined" : dao?.account.name}</Typography>
              </Stack>
              <Box marginTop={"1rem"}>
                <TabContext value={tabValue}>
                  <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                    <TabList onChange={handleChangeTabs}>
                      <Tab sx={{ fontSize: "0.7rem", padding: "0 !important" }} label="Management" value="1" />
                      <Tab sx={{ fontSize: "0.7rem", padding: "0 !important" }} label="Details" value="2" />
                    </TabList>
                  </Box>
                  <TabPanel value="1" sx={{ padding: "0", paddingTop: "1rem" }}>
                    <Stack direction={"column"} spacing={1}>
                      <Stack
                        direction={"row"}
                        spacing={2}
                        onClick={() => {
                          if (members.length > 0) {
                            handleOpen(setMembersOpen);
                          } else {
                            toastr.warning("There are no members for this dao.");
                          }
                        }}
                        className={classes.managementItems}
                      >
                        <PeopleAltIcon sx={{ fontSize: "24px", color: "#A56BFA" }}></PeopleAltIcon>
                        <Typography variant={"subtitle2"}>Members</Typography>
                      </Stack>
                      <MembersModal
                        open={membersOpen}
                        handleClose={() => {
                          handleClose(setMembersOpen);
                        }}
                        daoName={dao ? dao.account.name : "def"}
                        members={members}
                        token={token!.value}
                      ></MembersModal>
                      <Stack
                        direction={"row"}
                        spacing={2}
                        onClick={() => {
                          setShowConfigModal(true);
                        }}
                        className={classes.managementItems}
                      >
                        <SettingsIcon sx={{ fontSize: "24px", color: "#A56BFA" }}></SettingsIcon>
                        <Typography variant={"subtitle2"}>Parameters</Typography>
                      </Stack>
                    </Stack>
                  </TabPanel>
                  <TabPanel value="2" sx={{ padding: "0", paddingTop: "1rem" }}>
                    {dao && (
                      <Stack className={classes.detailItems}>
                        <Typography variant={"subtitle2"}>Details</Typography>
                        <Typography variant={"subtitle2"}>Program Version: 3</Typography>
                        <Typography variant={"subtitle2"}>
                          Program : &nbsp;
                          {
                            <a target="_blank" href="https://solscan.io/account/GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw?cluster=devnet">
                              {GOVERNANCE_PROGRAM_ID.toBase58().slice(0, 16) + "..." + GOVERNANCE_PROGRAM_ID.toBase58().slice(-5)}
                            </a>
                          }
                        </Typography>
                      </Stack>
                    )}
                  </TabPanel>
                </TabContext>
              </Box>
            </CardContent>
          </Card>
          <DaoGovernancePower
            membersCount={members.length}
            token={token}
            type={daoType!}
            style={classes.card}
            member={members.find((mb) => mb.account.governingTokenOwner.toBase58() === publicKey?.toBase58())}
            depositOnClick={() => {
              setShowDepositModal(true);
            }}
            withdrawOnClick={() => {
              setShowDepositModal(true);
            }}
          />
          <Card className={classes.card}>
            <CardContent>
              <Typography variant={"h6"}>Dao Wallets</Typography>
            </CardContent>
          </Card>
        </Stack>
      </Grid>
      <Grid item xl={8} lg={8} md={8} sm={8} xs={12}>
        <Card className={classes.card}>
          <CardContent className={classes.cardContent}>
            <Typography variant={"h5"}>Proposals</Typography>
            <Stack direction={"row"} marginTop={"1rem"} spacing={2} display={"flex"} alignItems={"center"}>
              <SearchInput label="Search Proposal" onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleSearch(event)}></SearchInput>
              <FilterSelector filters={filtersTitle} selectedFilters={selectedFilter} setSelectedFilters={setSelectedFilter}></FilterSelector>
              <Button variant="outlined" size="small" sx={{ width: "15rem" }} onClick={() => setShowCreateProposalModal(true)}>
                + New Proposal
              </Button>
            </Stack>
            <div className="scroll-container" style={{ maxHeight: "20rem", overflowY: "scroll" }}>
              <Stack direction={"row"} marginTop={"1rem"} spacing={2}>
                <Typography variant={"body2"}>{proposals ? proposals.length : "0"} proposal</Typography>
              </Stack>
              <Stack direction={"column"} marginTop={"1rem"} spacing={2}>
                {proposals &&
                  !searchFlag &&
                  proposals
                    .filter((onGoingProposal) => onGoingProposal.account.state == ProposalState.Voting)
                    .map((onGoingProposal, index: number) =>
                      onGoingProposal.account.voteType.type === VoteTypeKind.SingleChoice ? (
                        <ExecutableProposalCard
                          daoInstance={daoInstance!}
                          proposal={onGoingProposal}
                          config={daoConfig!}
                          token={token!.value}
                          threshold={daoConfig!.config.communityVoteThreshold.value || daoConfig?.config.councilVoteThreshold.value || 0}
                          membersCount={members.length}
                          key={index}
                        />
                      ) : (
                        <NonExecutableProposalCard
                          key={index}
                          daoInstance={daoInstance!}
                          proposal={onGoingProposal}
                          config={daoConfig!}
                          token={token!.value}
                          setLoading={setLoading}
                        />
                      )
                    )}
                {proposals &&
                  !searchFlag &&
                  proposals
                    .filter((concludedProposal) => concludedProposal.account.state != ProposalState.Voting)
                    .map((proposal) => <ConcludedProposal proposal={proposal} title={proposal.account.name}></ConcludedProposal>)}
                {searchFlag &&
                  searchedProposal
                    .filter((onGoingProposal) => onGoingProposal.account.state == ProposalState.Voting)
                    .map((filteredProposal) =>
                      filteredProposal.account.voteType.vote === VoteTypeKind.SingleChoice ? (
                        <ExecutableProposalCard
                          daoInstance={daoInstance!}
                          proposal={filteredProposal}
                          config={daoConfig!}
                          token={token!.value}
                          threshold={daoConfig!.config.communityVoteThreshold.value || 0}
                          membersCount={members.length}
                        />
                      ) : (
                        <NonExecutableProposalCard daoInstance={daoInstance!} proposal={filteredProposal} config={daoConfig!} token={token!.value} setLoading={setLoading} />
                      )
                    )}
                {searchFlag &&
                  searchedProposal
                    .filter((concludedProposal) => concludedProposal.account.state != ProposalState.Voting)
                    .map((filteredProposal) => <ConcludedProposal proposal={filteredProposal} title={filteredProposal.account.name}></ConcludedProposal>)}
              </Stack>
            </div>
          </CardContent>
        </Card>
      </Grid>
      {createProposalModal()}
      {daoConfigModal()}
      {depositModal()}
    </Grid>
  );
};

export default DaoDetails;
