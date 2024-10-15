//Todo
// here when ever the logout is triggred then the components
// are rendering correctly but then loggingin then it is not
// rendering to takel this issuse we must use REDUX-TOOL-KIT
// for state management of the userId fro rendering the components in the navbar

import React, { useEffect, useState } from "react";
import CampaignIcon from "@mui/icons-material/Campaign";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import ChatIcon from "@mui/icons-material/Chat";
import appname from "../../temp/appname";
import { Link, useNavigate } from "react-router-dom";
import WhisperIcon from "../EchoWhisper/WhisperIcon";

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
    <div className="navbar bg-base-100">
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost text-xl">
          {appname}
        </Link>
      </div>

      <div className="flex-none">
        {userId === "1" ? (
          <>
            <div tabIndex={0} role="button" className="btn btn-ghost avatar">
              <Link to="echo-link">
                <ChatIcon />
                <div>EchoLink</div>
              </Link>
            </div>
            <div className="drawer drawer-end">
              <input
                id="my-drawer-4"
                type="checkbox"
                className="drawer-toggle"
              />
              <div className="drawer-content">
                <label htmlFor="my-drawer-4" className="drawer-button">
                  <div className="btn btn-circle avatar">
                    <div className="w-12 rounded-full">
                      <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
                    </div>
                  </div>
                </label>
              </div>
              <div className="drawer-side">
                <label
                  htmlFor="my-drawer-4"
                  aria-label="close sidebar"
                  className="drawer-overlay"
                ></label>
                <ul className="menu bg-base-200 text-base-content min-h-full w-80 p-10 flex flex-col">
                  <div className="flex-grow">
                    <li className="w-full m-2">
                      <label
                        htmlFor="my-drawer-4"
                        aria-label="close sidebar"
                        className="btn bg-base-300 drawer-overlay rounded-lg text-xl"
                        onClick={() => {
                          navigate("/edit-profile");
                        }}
                      >
                        <EditOutlinedIcon />
                        Edit Details
                      </label>
                    </li>
                    <li className="w-full m-2">
                      <label
                        htmlFor="my-drawer-4"
                        aria-label="close sidebar"
                        className="btn bg-base-300 drawer-overlay rounded-lg text-xl"
                        onClick={() => {
                          navigate("/echo-shout");
                        }}
                      >
                        <CampaignIcon />
                        EchoShout
                      </label>
                    </li>
                    <li className="w-full m-2">
                      <button
                        onClick={handleLogout}
                        className="btn bg-base-300 rounded-lg text-xl"
                      >
                        <LogoutOutlinedIcon />
                        Logout
                      </button>
                    </li>
                  </div>
                  <div className="flex-none">
                    <li className="w-full items-end m-2">
                      <label className="swap swap-rotate">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={handleToggle}
                        />
                        {/* Sun icon */}
                        <svg
                          className="swap-on h-8 w-8 fill-current"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                        >
                          <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
                        </svg>
                        {/* Moon icon */}
                        <svg
                          className="swap-off h-8 w-8 fill-current"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                        >
                          <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
                        </svg>
                      </label>
                    </li>
                  </div>
                </ul>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center">
            <div tabIndex={0} role="button" className=" btn btn-ghost avatar">
              <Link to="echo-shout">
                <CampaignIcon />
                <div>EchoShout</div>
              </Link>
            </div>
            <div tabIndex={0} role="button" className="btn btn-ghost avatar">
              <WhisperIcon />
            </div>
            <div tabIndex={0} role="button" className="btn btn-ghost avatar">
              <label className="swap swap-rotate">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={handleToggle}
                />
                {/* Sun icon */}
                <svg
                  className="swap-on h-8 w-8 fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
                </svg>
                {/* Moon icon */}
                <svg
                  className="swap-off h-8 w-8 fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
                </svg>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default NavBar;
