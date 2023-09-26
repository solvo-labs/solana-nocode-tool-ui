import React from "react";
import { Avatar, Typography } from "@mui/material";

const DaoDetails = () => {
  return (
    <div style={{ width: "100%", display: "flex", justifyContent: "flex-start", alignItems: "flex-start" }}>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start" }}>
        <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", marginBottom: "20px" }}>
          <Avatar style={{ marginRight: "10px" }}>Logo</Avatar>
          <Typography>Token Name</Typography>
        </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start" }}>
          <Typography>About</Typography>
          <Typography>Name: {} </Typography>
          <Typography>Token: {} </Typography>
          <Typography>Website: {} </Typography>
          <Typography>Program Version: {} </Typography>
          <Typography>X: {} </Typography>
        </div>
        <div>
          <Typography>My Governance Power</Typography>
        </div>
        <div>
          <Typography>NFTs</Typography>
        </div>
        <div>
          <Typography>Dao Wallets & Assets</Typography>
        </div>
        <div>
          <Typography>Programs</Typography>
        </div>
      </div>
      <div></div>
    </div>
  );
};

export default DaoDetails;
