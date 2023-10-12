import React, {useEffect, useState} from "react";
import {Avatar, Box, Card, CardContent, Grid, Stack, Tab, Theme, Typography} from "@mui/material";
import axios from "axios";
import SearchInput from "../../components/SearchInput.tsx";
// import FilterSelector from "../../components/FilterSelector.tsx";
import {FILTERS} from "../../utils/enum.ts";
import FilterSelector from "../../components/FilterSelector.tsx";
import {makeStyles} from "@mui/styles";
import {TabContext, TabList, TabPanel} from "@mui/lab";
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import SettingsIcon from '@mui/icons-material/Settings';
import {DAO} from "../../lib/dao";
import toastr from "toastr";
import {useParams} from "react-router-dom";
import {PublicKey} from "@solana/web3.js";
// import {bs58} from "@project-serum/anchor/dist/cjs/utils/bytes";
import {useAnchorWallet, useConnection} from "@solana/wallet-adapter-react";

const useStyles = makeStyles((_theme: Theme) => ({
    card: {
        borderRadius: "12px !important",
        width: "100%",
    },
    cardContent: {
        padding: "1.5rem !important",
    },
    managementItem: {
        "&:hover": {
            backgroundColor: 'rgba(0,255,108,0.2)',
            borderRadius: "8px !important",
            cursor: "pointer",
        }
    }
}));

const DaoDetails: React.FC = () => {
    const classes = useStyles();
    const wallet = useAnchorWallet();
    const {connection} = useConnection();
    const [daoInstance, setDaoInstance] = useState<DAO>();
    const params = useParams();
    const pubkey = params.pubkey;

    const [dao, setDao] = useState();
    const [members, setMembers] = useState();

    const [surveys, setSurveys] = useState([
        {
            id: 1,
            baslik: "Yeni survey",
            status: "Draft",
        },
        {
            id: 2,
            baslik: "survey 2",
            status: "Completed",
        },
        {
            id: 3,
            baslik: "survey 3",
            status: "Cancelled",
        },
    ]);
    const [selectedFilter, setSelectedFilter] = useState<string>("");

    const [search, setSearch] = useState("");
    const [filteredSurveys, setFilteredSurveys] = useState(surveys);

    const filters: FILTERS[] = Object.values(FILTERS);
    console.log(filters)

    useEffect(() => {
        axios
            .get("https://api.example.com/surveys")
            .then((response) => {
                setSurveys(response.data);
            })
            .catch((error) => {
                console.error(error);
            });
    }, []);

    // @ts-ignore
    const handleFilter = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newFilter = event.target.value;

        if (newFilter === "") {
            setFilteredSurveys(surveys);
        } else {
            setFilteredSurveys(surveys.filter((survey) => survey.status === newFilter));
        }
    };

    // @ts-ignore
    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.target.value;

        setSearch(inputValue);

        const filtered = surveys.filter((survey) => survey.baslik.toLowerCase().includes(inputValue.toLowerCase()));
        setFilteredSurveys(filtered);
    };

    const [tabValue, setTabValue] = React.useState<string>("1");

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
                    const members = await daoInstance.getMembers(publickey);


                    // @ts-ignore
                    setMembers(members);
                    // @ts-ignore
                    setDao(daoDetail);
                } catch(error) {
                    console.log(error)
                    toastr.error("someting went wrong");
                }
            }
        };
        init();
    }, [daoInstance])


    // @ts-ignore
    return (
        <Grid container direction={"row"} spacing={2} width={"90vw"} display={"flex"} alignContent={"center"}
              marginTop={"4rem"}>
            <Grid item xl={4} lg={4} md={4} sm={4} xs={12}>
                <Stack spacing={2}>
                    <Card className={classes.card}>
                        <CardContent className={classes.cardContent}>
                            <Stack direction={"row"} spacing={2} alignItems={"center"}>
                                <Avatar alt="dao-name"
                                        src="data:image/png;base64,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">Logo</Avatar>
                                <Typography variant={"h6"}>Token Name</Typography>
                            </Stack>
                            {/*<Divider sx={{bgcolor: "black", marginTop: "1rem"}}></Divider>*/}

                            <Box marginTop={"1rem"}>
                                <TabContext value={tabValue}>
                                    <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
                                        <TabList onChange={handleChangeTabs}>
                                            <Tab sx={{fontSize: "0.7rem", padding: "0 !important"}} label="Management"
                                                 value="1"/>
                                            <Tab sx={{fontSize: "0.7rem", padding: "0 !important"}} label="Details"
                                                 value="2"/>
                                            {/*<Tab label="Item Three" value="3"/>*/}
                                        </TabList>
                                    </Box>
                                    <TabPanel value="1" sx={{padding: "0", paddingY: "1rem"}}>
                                        <Stack direction={"column"} spacing={2} marginX={"1rem"}>
                                            <Stack direction={"row"} spacing={2} onClick={() => {
                                                console.log("Asdsda")
                                            }}
                                                   className={classes.managementItem}>
                                                <PeopleAltIcon></PeopleAltIcon>
                                                <Typography>Members</Typography>
                                            </Stack>
                                            <Stack direction={"row"} spacing={2} onClick={() => {
                                                console.log("Asdsda")
                                            }}
                                                   className={classes.managementItem}>
                                                <SettingsIcon></SettingsIcon>
                                                <Typography>Parameters</Typography>
                                            </Stack>

                                        </Stack>
                                    </TabPanel>
                                    <TabPanel value="2" sx={{padding: "0", paddingY: "1rem"}}>
                                        {dao && (
                                            <Stack>
                                                <Typography variant={"subtitle2"}>Details</Typography>
                                                <Typography variant={"subtitle2"}>Token: {dao.dao.account.name}</Typography>
                                                <Typography variant={"subtitle2"}>Website:</Typography>
                                                <Typography variant={"subtitle2"}>Program Version:</Typography>
                                                {/*<Typography variant={"subtitle2"}>X:</Typography>*/}
                                            </Stack>
                                        )}
                                    </TabPanel>
                                    {/*<TabPanel value="3">Item Three</TabPanel>*/}
                                </TabContext>
                            </Box>
                            {/*<TabPanel value={"1"}>*/}
                            {/*    Item One*/}
                            {/*</TabPanel>*/}
                            {/*<TabPanel value={"2"}>*/}
                            {/*    Item Two*/}
                            {/*</TabPanel>*/}
                            {/*<TabPanel value={"3"}>*/}
                            {/*    Item Three*/}
                            {/*</TabPanel>*/}


                        </CardContent>
                    </Card>
                    <Card className={classes.card}>
                        <CardContent>
                            <Typography variant={"h6"}>My Governance Power</Typography>
                        </CardContent>
                    </Card>
                    <Card className={classes.card}>
                        <CardContent>
                            <Typography variant={"h6"}>NFT's</Typography>
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
                            <SearchInput
                                onChange={handleSearch}
                            ></SearchInput>
                            <FilterSelector
                                filters={filters}
                                selectedFilter={selectedFilter}
                                setFilter={() => setSelectedFilter}
                            ></FilterSelector>
                        </Stack>
                        <Stack direction={"row"} marginTop={"1rem"} spacing={2}>
                            <Typography variant={"body2"}>{filteredSurveys.length} proposal</Typography>
                        </Stack>
                        {filteredSurveys.map((survey) => (
                            <li key={survey.id}>
                                <div style={{display: "flex", alignItems: "center"}}>
                                    <div>{survey.baslik}</div>
                                    <div
                                        style={{
                                            color: `${survey.status === "Completed" ? "green" : survey.status === "Draft" ? "yellow" : "red"}`,
                                            padding: "5px",
                                            borderRadius: "8px",
                                        }}
                                    >
                                        {survey.status}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </CardContent>
                </Card>
            </Grid>
            {/*  <Grid item xs={1} style={{ marginTop: "20px" }}></Grid>*/}
            {/*  <Grid item xs={3} style={{ marginTop: "20px" }}>*/}
            {/*    <div style={{ marginLeft: "25px", backgroundColor: "white", color: "black", borderRadius: "8px" }}>*/}
            {/*      <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", padding: "20px" }}>*/}
            {/*        <Avatar style={{ marginRight: "10px" }}>Logo</Avatar>*/}
            {/*        <Typography>Token Name</Typography>*/}
            {/*      </div>*/}
            {/*      <Divider />*/}
            {/*      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start", padding: "20px" }}>*/}
            {/*        <Typography style={{ fontWeight: "bold", marginBottom: "10px", textDecoration: "underline" }}>About</Typography>*/}
            {/*        <div>*/}
            {/*          <Typography style={{ fontSize: "18px" }}>Name: {} </Typography>*/}
            {/*          <Typography style={{ fontSize: "18px" }}>Token: {} </Typography>*/}
            {/*          <Typography style={{ fontSize: "18px" }}>Website: {} </Typography>*/}
            {/*          <Typography style={{ fontSize: "18px" }}>Program Version: {} </Typography>*/}
            {/*          <Typography style={{ fontSize: "18px" }}>X: {} </Typography>*/}
            {/*        </div>*/}
            {/*      </div>*/}
            {/*    </div>*/}
            {/*    <div style={{ marginLeft: "25px", backgroundColor: "white", color: "black", borderRadius: "8px", marginTop: "20px" }}>*/}
            {/*      <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", padding: "20px" }}>*/}
            {/*        <Typography style={{ fontWeight: "bold", marginBottom: "10px", textDecoration: "underline" }}>My Governance Power</Typography>*/}
            {/*      </div>*/}
            {/*    </div>*/}
            {/*    <div style={{ marginLeft: "25px", backgroundColor: "white", color: "black", borderRadius: "8px", marginTop: "20px" }}>*/}
            {/*      <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", padding: "20px" }}>*/}
            {/*        <Typography style={{ fontWeight: "bold", marginBottom: "10px", textDecoration: "underline" }}>NFTs</Typography>*/}
            {/*      </div>*/}
            {/*    </div>*/}
            {/*    <div style={{ marginLeft: "25px", backgroundColor: "white", color: "black", borderRadius: "8px", marginTop: "20px" }}>*/}
            {/*      <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", padding: "20px" }}>*/}
            {/*        <Typography style={{ fontWeight: "bold", marginBottom: "10px", textDecoration: "underline" }}>Dao Wallets & Assets</Typography>*/}
            {/*      </div>*/}
            {/*    </div>*/}
            {/*    <div style={{ marginLeft: "25px", backgroundColor: "white", color: "black", borderRadius: "8px", marginTop: "20px" }}>*/}
            {/*      <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", padding: "20px" }}>*/}
            {/*        <Typography style={{ fontWeight: "bold", marginBottom: "10px", textDecoration: "underline" }}>Programs</Typography>*/}
            {/*      </div>*/}
            {/*    </div>*/}
            {/*  </Grid>*/}
            {/*  <Grid item xs={6} style={{ marginTop: "20px" }}>*/}
            {/*    <Typography style={{ padding: "20px" }}>Proposal</Typography>*/}
            {/*    <Divider />*/}
            {/*    <div style={{ padding: "20px" }}>*/}
            {/*      <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>*/}
            {/*        <div>*/}
            {/*          <input*/}
            {/*            style={{ width: "400px", height: "20px", padding: "10px", borderRadius: "8px", border: "1px solid #000", backgroundColor: "transparent", color: "black" }}*/}
            {/*            type="text"*/}
            {/*            placeholder="Search Proposals"*/}
            {/*            value={search}*/}
            {/*            onChange={handleSearch}*/}
            {/*          />*/}
            {/*        </div>*/}
            {/*        <div>*/}
            {/*          <select*/}
            {/*            value={selectedFilter}*/}
            {/*            onChange={(event) => {*/}
            {/*              console.log("event.target.value", event.target.value);*/}
            {/*              handleFilter(event);*/}
            {/*              setSelectedFilter(event.target.value);*/}
            {/*            }}*/}
            {/*          >*/}
            {/*            <option value="">All</option>*/}
            {/*            <option value="Cancelled">Cancelled</option>*/}
            {/*            <option value="Completed">Completed</option>*/}
            {/*            <option value="Defeated">Defeated</option>*/}
            {/*            <option value="Draft">Draft</option>*/}
            {/*            <option value="Executable">Executable</option>*/}
            {/*            <option value="Executing w/errors">Executing w/errors</option>*/}
            {/*            <option value="Signingoff">Signingoff</option>*/}
            {/*            <option value="Voting">Voting</option>*/}
            {/*            <option value="Vetoed">Vetoed</option>*/}
            {/*            <option value="Voting Without Quorum">Voting Without Quorum</option>*/}
            {/*          </select>*/}
            {/*        </div>*/}
            {/*      </div>*/}

            {/*      <ul style={{ padding: "20px" }}>*/}
            {/*        {filteredSurveys.map((survey) => (*/}
            {/*          <li key={survey.id}>*/}
            {/*            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "400px" }}>*/}
            {/*              <div>{survey.baslik}</div>*/}
            {/*              <div*/}
            {/*                style={{*/}
            {/*                  color: `${survey.status === "Completed" ? "green" : survey.status === "Draft" ? "yellow" : "red"}`,*/}
            {/*                  padding: "5px",*/}
            {/*                  borderRadius: "8px",*/}
            {/*                }}*/}
            {/*              >*/}
            {/*                {survey.status}*/}
            {/*              </div>*/}
            {/*            </div>*/}
            {/*          </li>*/}
            {/*        ))}*/}
            {/*      </ul>*/}
            {/*    </div>*/}
            {/*  </Grid>*/}
        </Grid>
    );
};

export default DaoDetails;
