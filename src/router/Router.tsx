import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Main from "../pages/Main";
import Login from "../pages/Login";
import TokenMint from "../pages/Token/TokenMint";
import { MyTokens } from "../pages/Token/MyTokens";
import { TokenTransfer } from "../pages/Token/TokenTransfer";
import { TokenBurn } from "../pages/Token/TokenBurn";

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
            <Route path="/burn-token" index element={<TokenBurn/>}></Route>
          </Route>
          <Route path="/login" index element={<Login />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default Router;
