import NavBar from "./components/ui/NavBar";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { normalLoading } from "./components/Loaders/LoadingAnimations.jsx";

function Layout() {
  const { loading } = useSelector((state) => state.auth);

  return (
    <div className="h-screen w-screen flex flex-col">
      <div className="flex-none">
        <NavBar />
      </div>
      <div className="flex-grow overflow-auto sm:p-4">
        {loading ? normalLoading() : <Outlet />}
      </div>
    </div>
  );
}

export default Layout;
