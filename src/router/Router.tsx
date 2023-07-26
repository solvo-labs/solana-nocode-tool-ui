import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Main from "../pages/Main";
import Login from "../pages/Login";
import TokenMint from "../pages/Token/TokenMint";
import { MyTokens } from "../pages/Token/MyTokens";
import { TokenTransfer } from "../pages/Token/TokenTransfer";
import { Stake } from "../pages/Stake/Stake";
import { TokenMintAndBurn } from "../pages/Token/TokenMintAndBurn";
import { FreezeAccount } from "../pages/Token/FreezeAccount";
import { CloseAccount } from "../pages/Token/CloseAccount";
import { Raffle } from "../pages/Token/Raffle";
import NotFoundPage from "../components/NotFound";
import { Multisignature } from "../pages/Token/Multisignature";

const Router: React.FC = () => {
  return (
    <>
      <BrowserRouter basename={"/"}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/" index element={<Main />} />
            <Route path="/token" index element={<TokenMint />} />
            <Route path="/my-tokens" index element={<MyTokens />} />
            <Route path="/token-transfer" index element={<TokenTransfer />} />
            <Route path="/stake" index element={<Stake />} />
            <Route path="/burn-mint-token" index element={<TokenMintAndBurn />} />
            <Route path="/freeze-account" index element={<FreezeAccount />} />
            <Route path="/close-account" index element={<CloseAccount />} />
            <Route path="/raffle" index element={<Raffle />} />
            <Route path="/multisignature" index element={<Multisignature />} />
          </Route>
          <Route path="/login" index element={<Login />} />
          <Route path="*" index element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default Router;
