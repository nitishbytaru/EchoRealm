import { Link } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";
import WhisperIcon from "../EchoWhisper/WhisperIcon.jsx";

//importing the components
import {
  setIsMobile,
  setTheme,
  setIsChecked,
} from "../../app/slices/authSlice.js";
import {
  CampaignIcon,
  ChatIcon,
  HomeIcon,
} from "../../heplerFunc/exportIcons.js";
import { handleToggle } from "../../heplerFunc/microFuncs.js";

//lazy loading
const ThemeToggle = lazy(() => import("./ThemeToggle"));

function NavBar() {
  const dispatch = useDispatch();

  const { user, theme, isMobile, isLoggedIn, isChecked } = useSelector(
    (state) => state.auth
  );
  const { newUnreadMessages } = useSelector((state) => state.echoLink);

  // Update the isMobile state based on window size
  useEffect(() => {
    const handleResize = () => {
      dispatch(setIsMobile(window.innerWidth < 640));
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [dispatch]);

  useEffect(() => {
    dispatch(setTheme(theme));
    document.documentElement.setAttribute("data-theme", theme);
  }, [dispatch, theme]);

  return (
    <div className="navbar bg-base-100">
      {/* first element */}
      <div className="navbar-start">
        <Link to="/" className="btn text-sm sm:ml-r sm:text-xl sm:btn-ghost">
          {isMobile ? <HomeIcon /> : "EchoRealm"}
        </Link>
      </div>

      {/* center elements */}
      <div className="navbar-center">
        <ul className="menu menu-horizontal bg-base-200 rounded-box p-1">
          {isLoggedIn ? (
            <li>
              <div>
                <Link to="echo-link">
                  <div className="flex">
                    <div>
                      <ChatIcon />
                    </div>
                    {!isMobile ? <div className="ml-2">EchoLink</div> : null}
                  </div>
                </Link>
                {newUnreadMessages != "0" && (
                  <span className="absolute -top-1 -left-1 bg-primary text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                    {newUnreadMessages}
                  </span>
                )}
              </div>
            </li>
          ) : null}
          <li>
            <Link to="/echo-shout">
              <div className="flex items-center">
                <CampaignIcon />
                {!isMobile ? <div className="ml-2">EchoShout</div> : null}
              </div>
            </Link>
          </li>
          {isLoggedIn ? (
            <li>
              <div>
                <WhisperIcon />
              </div>
            </li>
          ) : null}
        </ul>
      </div>

      {/* profile element */}
      <div className="navbar-end">
        <div className="flex-none">
          {user ? (
            <>
              <Suspense fallback={<div>Loading...</div>}>
                <div tabIndex={0} role="button" className="rounded-btn">
                  <label className="btn-circle avatar items-center justify-center sm:mr-2">
                    <div
                      className={`${
                        isMobile ? "w-10 h-10" : "w-12 h-12"
                      } rounded-full `}
                    >
                      <Link to={"my-profile"}>
                        <img src={user.avatar.url} alt="User Avatar" />
                      </Link>
                    </div>
                  </label>
                </div>
              </Suspense>
            </>
          ) : (
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost p-0 text-center"
            >
              {/* Theme Toggle (Dark/Light mode) */}
              <Suspense fallback={<div>Loading...</div>}>
                <ThemeToggle
                  handleToggle={(e) =>
                    handleToggle(e, dispatch, setTheme, setIsChecked)
                  }
                  isChecked={isChecked}
                />
              </Suspense>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NavBar;
