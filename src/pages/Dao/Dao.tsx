import React, { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { DAO } from "../../lib/dao";
import { Box, CircularProgress, Tab, Tabs } from "@mui/material";
import { Realm, ProgramAccount } from "@solana/spl-governance";
import ListDaos from "../../components/ListDaos";
// import { makeStyles } from "@mui/styles";

import toastr from "toastr";
import { TabContext, TabPanel } from "@mui/lab";

// const useStyles = makeStyles(() => ({
//   daoContainer: {
//     position: "relative",
//     display: "flex",
//     flexWrap: "wrap",
//   },
//   daoBoxes: {},
// }));

export const Dao = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("1");
  // const classes = useStyles();
  const characterLimit = 50;
  const [daoInstance, setDaoInstance] = useState<DAO>();
  const [daos, setDaos] = useState<ProgramAccount<Realm>[]>([]);
  const [myDaos, setMyDaos] = useState<ProgramAccount<Realm>[]>([]);
  const { publicKey } = useWallet();

  const { connection } = useConnection();

  useEffect(() => {
    if (publicKey) {
      const daoClass = new DAO(connection, publicKey);
      setDaoInstance(daoClass);
    }
  }, [connection, publicKey]);

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
    <TabContext value={activeTab}>
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Tabs
          onChange={(_event: React.SyntheticEvent, newValue: string) => {
            setActiveTab(newValue);
          }}
          style={{ marginBottom: "5px" }}
        >
          <Tab style={{ outline: "none", fontWeight: "bold", marginRight: "5px", borderBottom: "1px solid #ffffff" }} label="My Dao's" value="1" />
          <Tab style={{ outline: "none", fontWeight: "bold", borderBottom: "1px solid #ffffff" }} label="Dao's" value="2" />
        </Tabs>
      </Box>
      <TabPanel value="1">
        <ListDaos daos={myDaos} characterLimit={characterLimit} />
      </TabPanel>
      <TabPanel value="2">
        <ListDaos daos={daos} characterLimit={characterLimit} />
      </TabPanel>
    </TabContext>
  );
};
