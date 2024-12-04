import { Link } from "react-router-dom";
import socket from "../../sockets/socket.js";
import { useEffect, lazy, Suspense } from "react";
import MumbleIcon from "../EchoMumble/MumbleIcon.jsx";
import { useDispatch, useSelector } from "react-redux";
import { handleToggle } from "../../heplerFunc/microFuncs.js";
import { useFriendRequests } from "../../hooks/useFriendRequests.js";
import { useJoinRoomSocket } from "../../hooks/useJoinRoomSocket.js";
import { useGetRequestsSocket } from "../../hooks/useGetRequestsSocket.js";
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
  MenuIcon,
} from "../../heplerFunc/exportIcons.js";


//lazy loading
const ThemeToggle = lazy(() => import("./ThemeToggle"));

function NavBar() {
  const dispatch = useDispatch();

  const { user, theme, isMobile, isLoggedIn, isChecked } = useSelector(
    (state) => state.auth
  );
  const { badgeOfPendingRequests } = useSelector((state) => state.user);
  const { newUnreadMessages } = useSelector((state) => state.echoLink);
  const { unReadMumbles } = useSelector((state) => state.echoMumble);

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

  //hook to fetch friendRequests and add new frindRequests notification badge
  useFriendRequests(user);

  //hook for socket to join room to get nitifications of new friendRequests
  useJoinRoomSocket(socket, user);

  //hook for getting the live updates like friendRequests
  useGetRequestsSocket(socket);

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
                <MumbleIcon />
                {unReadMumbles !== 0 && (
                  <span className="absolute -top-1 -left-1 bg-primary text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                    {unReadMumbles}
                  </span>
                )}
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
                    <Link to={"about/my-Mumbles"} className="btn sm:btn-ghost">
                      <MenuIcon sx={{ fontSize: "30px" }} />
                    </Link>
                  </label>
                </div>
              </Suspense>
              {badgeOfPendingRequests != 0 && (
                <span className="absolute top-2  bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center sm:text-sm">
                  {badgeOfPendingRequests}
                </span>
              )}
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
