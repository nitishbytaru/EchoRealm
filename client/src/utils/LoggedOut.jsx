import { Outlet } from "react-router-dom";

import EchoLink from "../features/echoLink/views/EchoLink.jsx";


function LoggedOut({ user }) {
  return !user ? <Outlet /> : <EchoLink />;
}

export default LoggedOut;
