import React, { useEffect, useState } from "react";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { DAO } from "../../lib/dao/index";
import { Box, CircularProgress, Tab } from "@mui/material";
import { Realm, ProgramAccount } from "@solana/spl-governance";
import ListDaos from "../../components/ListDaos";
import toastr from "toastr";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { CustomButton } from "../../components/CustomButton";
import { useNavigate } from "react-router-dom";

export const Dao = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("1");
  const characterLimit = 50;
  const [daoInstance, setDaoInstance] = useState<DAO>();
  const [daos, setDaos] = useState<ProgramAccount<Realm>[]>([]);
  const [myDaos, setMyDaos] = useState<ProgramAccount<Realm>[]>([]);
  const navigate = useNavigate();

  const wallet = useAnchorWallet();

  const { connection } = useConnection();

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
    <div style={{ padding: "25px" }}>
      <TabContext value={activeTab}>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <div></div>
          <TabList
            onChange={(_event: React.SyntheticEvent, newValue: string) => {
              setActiveTab(newValue);
            }}
            style={{ marginBottom: "5px" }}
          >
            <Tab value="1" style={{ outline: "none", fontWeight: "bold", marginRight: "5px" }} label="Dao's" />
            <Tab value="2" style={{ outline: "none", fontWeight: "bold" }} label="My Dao's" />
          </TabList>
          <CustomButton label="create dao" disable={false} onClick={() => navigate("/create-dao")} />
        </Box>
        <TabPanel style={{ padding: "0px" }} value="1">
          <ListDaos daos={daos} characterLimit={characterLimit} />
        </TabPanel>
        <TabPanel style={{ padding: "0px" }} value="2">
          <ListDaos daos={myDaos} characterLimit={characterLimit} />
        </TabPanel>
      </TabContext>
    </div>
  );
};
