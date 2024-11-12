import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, lazy, Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";
import WhisperIcon from "../EchoWhisper/WhisperIcon.jsx";

//importing the components
import { logout } from "../../api/userApi";
import {
  setIsLoggedIn,
  setTheme,
  setUser,
} from "../../app/slices/authSlice.js";
import toast from "react-hot-toast";
import {
  CampaignIcon,
  ChatIcon,
  EditOutlinedIcon,
  LogoutOutlinedIcon,
} from "../../heplerFunc/exportIcons.js";

//lazy loading
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
    <div className="navbar bg-base-100">
      {/* first element */}
      <div className="navbar-start">
        <Link to="/" className="btn text-sm sm:ml-2 sm:text-xl sm:btn-ghost">
          EchoRealm
        </Link>
      </div>

      {/* center elements */}
      <div className="navbar-center">
        <ul className="menu menu-horizontal bg-base-200 rounded-box">
          <li>
            <div>
              <Link to="echo-link">
                <div className="flex">
                  <div>
                    <ChatIcon />
                  </div>
                  <div>EchoLink</div>
                </div>
              </Link>
              {newUnreadMessages != "0" && (
                <span className="absolute -top-1 -left-1 bg-primary text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                  {newUnreadMessages}
                </span>
              )}
            </div>
          </li>
          <li>
            <Link to="/echo-shout">
              <div className="flex">
                <div>
                  <CampaignIcon />
                </div>
                <div>EchoShout</div>
              </div>
            </Link>
          </li>
          <li>
            <div>
              <WhisperIcon />
            </div>
          </li>
        </ul>
      </div>

      {/* profile element */}
      <div className="navbar-end">
        <div className="flex-none mr-4">
          {user ? (
            <>
              <Suspense fallback={<div>Loading...</div>}>
                <div className="dropdown dropdown-end">
                  <div tabIndex={0} role="button" className="rounded-btn">
                    <label className="btn-circle avatar">
                      <div className="w-12 rounded-full">
                        <img src={user.avatar.url} alt="User Avatar" />
                      </div>
                    </label>
                  </div>
                  <ul
                    tabIndex={0}
                    className="menu dropdown-content bg-base-300 rounded-box z-[1] w-52 p-2 shadow"
                  >
                    <li>
                      <button
                        className="btn bg-base-100 rounded-lg text-xl mb-2"
                        onClick={() => navigate("/edit-profile")}
                      >
                        <EditOutlinedIcon />
                        Profile
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={handleLogout}
                        className="btn bg-base-100 rounded-lg text-xl mb-2"
                      >
                        <LogoutOutlinedIcon />
                        Logout
                      </button>
                    </li>
                    <li className="w-full items-end">
                      <ThemeToggle
                        handleToggle={handleToggle}
                        isChecked={isChecked}
                      />
                    </li>
                  </ul>
                </div>
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
    </div>
  );
}

export default NavBar;
