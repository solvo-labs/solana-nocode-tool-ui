import React, { useEffect, useMemo, useState } from "react";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { DAO } from "../../lib/dao/index";
import { CircularProgress, Grid, Tab } from "@mui/material";
import { Realm, ProgramAccount } from "@solana/spl-governance";
import ListDaos from "../../components/ListDaos";
import toastr from "toastr";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { CustomButton } from "../../components/CustomButton";
import { useNavigate } from "react-router-dom";
import { makeStyles } from "@mui/styles";
import SearchInput from "../../components/SearchInput.tsx";

const useStyles = makeStyles(() => ({
  gridContainer: {
    display: "flex !important",
    justifyContent: "center !important",
    alignItems: "flex-start !important",
    alignContent: "flex-start !important",
    padding: "16px !important",
    height: "100% !important",
    width: "100vw !important",
  },
  gridItem: {
    padding: "16px !important",
  },
}));

export const Dao = () => {
  const classes = useStyles();

  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("1");
  const characterLimit = 50;
  const [daoInstance, setDaoInstance] = useState<DAO>();
  const [daos, setDaos] = useState<ProgramAccount<Realm>[]>([]);
  const [myDaos, setMyDaos] = useState<ProgramAccount<Realm>[]>([]);
  const [filteredDaos, setFilteredDaos] = useState<ProgramAccount<Realm>[]>([]);
  const [filteredMyDaos, setFilteredMyDaos] = useState<ProgramAccount<Realm>[]>([]);
  const [search, setSearch] = useState<string>("");
  const navigate = useNavigate();

  const wallet = useAnchorWallet();

  const { connection } = useConnection();

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    setSearch(inputValue);
    if (activeTab == "1") {
      const filtered = daos.filter((dao) => dao.account.name.toLowerCase().includes(inputValue.toLowerCase()));
      setFilteredDaos(filtered);
    } else if (activeTab == "2") {
      const filtered = myDaos.filter((myDao) => myDao.account.name.toLowerCase().includes(inputValue.toLowerCase()));
      setFilteredMyDaos(filtered);
    }
  };

  const searchFlag = useMemo(() => {
    return search != "";
  }, [search]);

  useEffect(() => {
    if (wallet) {
      const daoClass = new DAO(connection, wallet);
      setDaoInstance(daoClass);
    }
  }, [connection, wallet]);

  useEffect(() => {
    const fetch = async () => {
      if (daoInstance) {
        try {
          const { allDaos, myDaos } = await daoInstance.fetchDaos();

          // console.log("daoInstance.fetchDaos()", await daoInstance.fetchDaos());
          // console.log("myDaos", typeof myDaos);
          // console.log("allDaos", allDaos);
          // console.log("allDaos", typeof allDaos);

          setDaos(allDaos);
          console.log(allDaos);
          setMyDaos(myDaos);
          setLoading(false);
        } catch {
          toastr.error("someting went wrong");
        }
      }
    };

    fetch();
  }, [daoInstance]);

  // console.log("daos", daos[0].pubkey.toBase58());
  // console.log(daos[0].pubkey.toBase58());
  // console.log(daos[0].account.name);

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
    <Grid container spacing={2} className={classes.gridContainer}>
      <Grid item xs={12} className={classes.gridItem}>
        <TabContext value={activeTab}>
          <Grid
            container
            style={{
              display: "flex",
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "space-between",
              padding: "20px",
            }}
          >
            <TabList
              onChange={(_event: React.SyntheticEvent, newValue: string) => {
                setActiveTab(newValue);
              }}
              style={{ marginBottom: "5px" }}
            >
              <Tab value="1" style={{ outline: "none", fontWeight: "bold", marginRight: "5px" }} label="Dao's" />
              <Tab value="2" style={{ outline: "none", fontWeight: "bold" }} label="My Dao's" />
            </TabList>
            <Grid item sx={{ width: "600px" }}>
              <SearchInput label={activeTab == "1" ? "Search Dao" : "Search Your Dao"} onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleSearch(event)}></SearchInput>
            </Grid>
            <CustomButton label="create dao" disable={false} onClick={() => navigate("/create-dao")} />
          </Grid>
          <TabPanel style={{ padding: "0px" }} value="1">
            <ListDaos daos={searchFlag ? filteredDaos : daos} characterLimit={characterLimit} />
          </TabPanel>
          <TabPanel style={{ padding: "0px" }} value="2">
            <ListDaos daos={searchFlag ? filteredMyDaos : myDaos} characterLimit={characterLimit} />
          </TabPanel>
        </TabContext>
      </Grid>
    </Grid>
  );
};
