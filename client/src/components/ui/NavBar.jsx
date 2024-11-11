import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, lazy, Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";

//importing the components
import { logout } from "../../api/userApi";
import {
  setIsLoggedIn,
  setTheme,
  setUser,
} from "../../app/slices/authSlice.js";
import toast from "react-hot-toast";
import { CampaignIcon, ChatIcon } from "../../heplerFunc/exportIcons.js";

//lazy loading
const NavDrawer = lazy(() => import("./NavDrawer"));
const ThemeToggle = lazy(() => import("./ThemeToggle"));

function NavBar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { theme } = useSelector((state) => state.auth);
  const { newUnreadMessages } = useSelector((state) => state.echoLink);

  const [isChecked, setIsChecked] = useState(theme === "dracula");

  useEffect(() => {
    dispatch(setTheme(theme));
    document.documentElement.setAttribute("data-theme", theme);
  }, [dispatch, theme]);

  const handleLogout = () => {
    logout()
      .then((response) => {
        toast.success(response?.data?.message);
        dispatch(setUser(null));
        dispatch(setIsLoggedIn(false));
        localStorage.setItem("allowFetch", false);
      })
      .catch((error) => console.log(error));
    navigate("/");
  };

  const handleToggle = (e) => {
    if (e.target.checked) {
      dispatch(setTheme("dracula"));
      localStorage.setItem("theme", "dracula");
      setIsChecked(true);
    } else {
      dispatch(setTheme("retro"));
      localStorage.setItem("theme", "retro");
      setIsChecked(false);
    }
  };

  return (
    <div className="navbar bg-base-100 w-full">
      <div className="flex-1">
        <Link to="/" className="btn text-sm sm:ml-2 sm:text-xl sm:btn-ghost">
          EchoRealm
        </Link>
      </div>

      <div className="flex-none sm:mr-8">
        {user ? (
          <>
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost bg-base-300 relative sm:mr-2"
            >
              <Link to="echo-link" className="flex items-center">
                <ChatIcon />
                <div>EchoLink</div>
              </Link>
              {newUnreadMessages != "0" && (
                <span className="absolute -top-1 -left-1 bg-primary text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                  {newUnreadMessages}
                </span>
              )}
            </div>

            <Suspense fallback={<div>Loading...</div>}>
              <NavDrawer
                handleLogout={handleLogout}
                handleToggle={handleToggle}
                isChecked={isChecked}
              />
            </Suspense>
          </>
        ) : (
          <div className="flex items-center justify-between w-full sm:px-2 space-x-2">
            {/* EchoShout button */}
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost p-0 mx-1 text-center sm:p-1"
            >
              <Link to="echo-shout" className="flex flex-col items-center">
                <CampaignIcon className="text-lg" />
                <div>EchoShout</div>
              </Link>
            </div>

            {/* Theme Toggle (Dark/Light mode) */}
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost p-0 text-center"
            >
              <Suspense fallback={<div>Loading...</div>}>
                <ThemeToggle
                  handleToggle={handleToggle}
                  isChecked={isChecked}
                />
              </Suspense>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default NavBar;
