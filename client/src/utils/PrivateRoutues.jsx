import React from "react";
import { Navigate, Outlet } from "react-router-dom";

function PrivateRoutues() {
  return localStorage.getItem("userId") === '1' ? (
    <Outlet />
  ) : (
    <Navigate to="/" />
  );
}

export default PrivateRoutues;
