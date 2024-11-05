import React from "react";
import { Outlet } from "react-router-dom";
import LandingPage from "../pages/LandingPage";

function LoggedOut({ user }) {
  return !user ? <Outlet /> : <LandingPage />;
}

export default LoggedOut;
