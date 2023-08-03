import { Card, CardContent, Typography } from "@mui/material";
// import { PublicKey } from "@solana/web3.js";
import React from "react";

type Props = {
  publicKey: string;
  balance: number;
};

const Profile: React.FC<Props> = ({ publicKey, balance }) => {
  return (
    <Card sx={{ borderRadius: "12px"}}>
      <CardContent>
        <Typography sx={{ fontSize: 28 }} color="text.secondary" gutterBottom>
          Wallet: 
        </Typography>
        <Typography variant="body2">{publicKey}</Typography>
        <Typography sx={{ mb: 1.5 }} color="text.secondary">
          Balance: {balance} SOL
        </Typography>
      </CardContent>
    </Card>
  );
};

export default Profile;
