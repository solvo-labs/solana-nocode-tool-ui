import React from "react";
import { Outlet } from "react-router-dom";

const ProtectedRoute: React.FC = () => {
  return (
    <div>
      <Outlet />
    </div>
  );
};

export default ProtectedRoute;
