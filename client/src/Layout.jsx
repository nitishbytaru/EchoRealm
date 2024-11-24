import NavBar from "./components/ui/NavBar";
import { Outlet } from "react-router-dom";

function Layout() {

  return (
    <div className="h-screen w-screen flex flex-col">
      <div className="flex-none">
        <NavBar />
      </div>
      <div className="flex-grow overflow-auto sm:p-4">
        <Outlet />
      </div>
    </div>
  );
}

export default Layout;
