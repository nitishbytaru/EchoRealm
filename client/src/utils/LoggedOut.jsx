import { Outlet } from "react-router-dom";
import EchoLink from "../pages/stage2/EchoLink";


function LoggedOut({ user }) {
  return !user ? <Outlet /> : <EchoLink />;
}

export default LoggedOut;
