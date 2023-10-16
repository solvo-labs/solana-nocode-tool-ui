/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useEffect, useMemo, useState } from "react";
import { Avatar, Box, Card, CardContent, CircularProgress, Grid, Stack, Tab, Theme, Typography } from "@mui/material";
import SearchInput from "../../components/SearchInput.tsx";
import { FILTERS } from "../../utils/enum.ts";
import FilterSelector from "../../components/FilterSelector.tsx";
import { makeStyles } from "@mui/styles";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import SettingsIcon from "@mui/icons-material/Settings";
import { DAO } from "../../lib/dao";
import toastr from "toastr";
import { useParams } from "react-router-dom";
import { PublicKey } from "@solana/web3.js";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import MembersModal from "../../components/MembersModal.tsx";
import { sleep } from "../../lib/utils.ts";
import { ProgramAccount, ProposalState, Realm, TokenOwnerRecord, VoteTypeKind } from "@solana/spl-governance";
import ExecutableProposalCard from "../../components/ProposalComponent/ExecutableProposalCard.tsx";
import NonExecutableProposalCard from "../../components/ProposalComponent/NonExecutableProposalCard.tsx";
import ConcludedProposal from "../../components/ProposalComponent/ConcludedProposal.tsx";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useStyles = makeStyles((_theme: Theme) => ({
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
  const [proposals, setProposals] = useState<any[]>();

  const [selectedFilter, setSelectedFilter] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [searchedProposal, setSearchedProposal] = useState<any[]>([]);
  // const [filters, setFilters] = useState<string[]>([]);
  // const [filteredProposal, setFilteredProposal] = useState([]);
  const [filtersTitle] = useState<FILTERS[]>(Object.values(FILTERS));

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

  // @ts-ignore
  const handleChangeTabs = (event: React.SyntheticEvent, newValue: number) => {
    // @ts-ignore
    setTabValue(newValue);
  };

  useEffect(() => {
    if (wallet) {
      const dao = new DAO(connection, wallet);
      setDaoInstance(dao);
    }
  }, [connection, wallet]);

  useEffect(() => {
    const init = async () => {
      if (daoInstance && pubkey) {
        try {
          const publickey = new PublicKey(pubkey);
          const daoDetail = await daoInstance.getDaoDetails(publickey);
          // await sleep(3000);
          const members = await daoInstance.getMembers(publickey);
          await sleep(3000);

          //   console.log(members[0].account.governingTokenDepositAmount.toNumber());

          const proposals = await daoInstance.getProposals(publickey);
          const result = proposals.map((proposal: any) => {
            return {
              account: {
                denyVoteWeight: proposal.account.denyVoteWeight,
                maxVoteWeight: proposal.account.maxVoteWeight,
                name: proposal.account.name,
                options: proposal.account.options,
                state: proposal.account.state,
                voteType: proposal.account.voteType,
                voteThreshold: proposal.account.voteThreshold,
              },
              pubkey: proposal.pubkey,
            };
          });

          setProposals(result);
          setMembers(members);
          setDao(daoDetail.dao);
          setLoading(false);
        } catch (error) {
          console.log(error);
          toastr.error("someting went wrong");
        }
      }
    };
    init();
  }, [daoInstance, pubkey]);

  // console.log(selectedFilter);

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
                          handleOpen(setMembersOpen);
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
                      ></MembersModal>
                      <Stack
                        direction={"row"}
                        spacing={2}
                        onClick={() => {
                          console.log("Asdsda");
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
                        <Typography variant={"subtitle2"}>Token: {}</Typography>
                        <Typography variant={"subtitle2"}>Website:</Typography>
                        <Typography variant={"subtitle2"}>Program Version:</Typography>
                      </Stack>
                    )}
                  </TabPanel>
                </TabContext>
              </Box>
            </CardContent>
          </Card>
          <Card className={classes.card}>
            <CardContent>
              <Typography variant={"h6"}>My Governance Power</Typography>
            </CardContent>
          </Card>
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
              <SearchInput onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleSearch(event)}></SearchInput>
              <FilterSelector filters={filtersTitle} selectedFilters={selectedFilter} setSelectedFilters={setSelectedFilter}></FilterSelector>
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
                    .map((onGoingProposal) =>
                      onGoingProposal.account.voteType.vote === VoteTypeKind.SingleChoice ? (
                        <ExecutableProposalCard title={onGoingProposal.account.name} />
                      ) : (
                        <NonExecutableProposalCard title={onGoingProposal.account.name} />
                      )
                    )}
                {proposals &&
                  !searchFlag &&
                  proposals
                    .filter((concludedProposal) => concludedProposal.account.state != ProposalState.Voting)
                    .map((proposal) => <ConcludedProposal title={proposal.account.name}></ConcludedProposal>)}
                {searchFlag &&
                  searchedProposal
                    .filter((onGoingProposal) => onGoingProposal.account.state == ProposalState.Voting)
                    .map((filteredProposal) =>
                      filteredProposal.account.voteType.vote === VoteTypeKind.SingleChoice ? (
                        <ExecutableProposalCard title={filteredProposal.account.name} />
                      ) : (
                        <NonExecutableProposalCard title={filteredProposal.account.name} />
                      )
                    )}
                {searchFlag &&
                  searchedProposal
                    .filter((concludedProposal) => concludedProposal.account.state != ProposalState.Voting)
                    .map((filteredProposal) => <ConcludedProposal title={filteredProposal.account.name}></ConcludedProposal>)}
              </Stack>
            </div>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default DaoDetails;
