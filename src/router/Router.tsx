import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Main from "../pages/Main";

const Router: React.FC = () => {
  return (
    <>
      <BrowserRouter basename={"/"}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/" index element={<Main />} />
          </Route>
          {/* <Route path="/login" index element={<Login />} /> */}
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default Router;
