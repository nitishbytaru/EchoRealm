//Todo
// here when ever the logout is triggred then the components
// are rendering correctly but then loggingin then it is not
// rendering to takel this issuse we must use REDUX-TOOL-KIT
// for state management of the userId fro rendering the components in the navbar

import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, lazy, Suspense } from "react";

//importing the components
import CampaignIcon from "@mui/icons-material/Campaign";
import ChatIcon from "@mui/icons-material/Chat";
import appname from "../../temp/appname";
//lazy loading
const WhisperIcon = lazy(() => import("../EchoWhisper/WhisperIcon"));
const NavDrawer = lazy(() => import("./NavDrawer"));
const ThemeToggle = lazy(() => import("./ThemeToggle"));

function NavBar() {
  const navigate = useNavigate();

  const [userId, setUserId] = useState(localStorage.getItem("userId") || "0");
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "retro");
  const [isChecked, setIsChecked] = useState(theme === "dracula");

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Effect to auto-render based on userId changes
  useEffect(() => {
    const handleStorageChange = () => {
      const storedUserId = localStorage.getItem("userId");
      setUserId(storedUserId || "0"); // Default to "0" if null
    };

    // Add event listener for storage changes
    window.addEventListener("storage", handleStorageChange);

    // Cleanup function
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.setItem("userId", "0");
    setUserId("0");
    navigate("/");
  };

  const handleToggle = (e) => {
    if (e.target.checked) {
      setTheme("dracula");
      setIsChecked(true);
    } else {
      setTheme("retro");
      setIsChecked(false);
    }
  };

  return (
    <div className="navbar bg-base-100 w-full">
      <div className="flex-1">
        <Link to="/" className="btn text-sm sm:ml-2 sm:text-xl sm:btn-ghost">
          {appname}
        </Link>
      </div>

      <div className="flex-none sm:mr-8">
        {userId === "1" ? (
          <>
            <div tabIndex={0} role="button" className="btn btn-ghost">
              <Link to="echo-link">
                <ChatIcon />
                <div>EchoLink</div>
              </Link>
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

            {/* Whisper Icon */}
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost p-0 text-center sm:p-1"
            >
              <Suspense fallback={<div>Loading...</div>}>
                <WhisperIcon className="text-lg" />
              </Suspense>
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
