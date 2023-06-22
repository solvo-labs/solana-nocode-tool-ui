import React from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletDisconnectButton, WalletMultiButton } from "@solana/wallet-adapter-react-ui";

const Login: React.FC = () => {
  const { connected } = useWallet();
  const navigate = useNavigate();

  if (connected) {
    navigate("/");
  }

  return (
    <div>
      <WalletMultiButton />
      <WalletDisconnectButton />
    </div>
  );
};

export default Login;
