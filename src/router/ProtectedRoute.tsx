import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { LinearProgress } from "@mui/material";
import TopBar from "../components/TopBar";
import { useWallet } from "@solana/wallet-adapter-react";

const ProtectedRoute: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);

  const { connected, publicKey, connecting } = useWallet();

  useEffect(() => {
    if (publicKey === undefined) {
      setLoading(false);
    }

    if (publicKey) {
      setLoading(false);
    }

    if (localStorage.getItem("walletName") === null) {
      setLoading(false);
    }
  }, [publicKey]);

  if (loading || connecting) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          width: "50vw",
          margin: 0,
        }}
      >
        <LinearProgress color="inherit" style={{ width: "80%" }} />
      </div>
    );
  }

  return connected ? (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <div style={{ height: "96px" }}>
        <TopBar />
      </div>
      <div style={{ height: `calc(100vh - 96px)`, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Outlet />
      </div>
    </div>
  ) : (
    <Navigate to="/login" />
  );
};

export default ProtectedRoute;
