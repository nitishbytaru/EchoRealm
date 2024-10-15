import React from "react";
import { Outlet } from "react-router-dom";
import LandingPage from "../pages/LandingPage";

function LoggedOut() {
  return localStorage.getItem("userId") === '0' ? (
    <Outlet />
  ) : (
    <LandingPage />
  );
}

export default LoggedOut;
