import toast from "react-hot-toast";
import { useTransition } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { logoutApi } from "../../../api/auth.api.js";
import Loading from "../../../components/Loading.jsx";
import ThemeToggle from "../../../components/ThemeToggle.jsx";
import { handleToggle } from "../../../utils/heplers/micro_funcs.js";
import {
  setTheme,
  setIsChecked,
  setUser,
  setIsLoggedIn,
} from "../../../app/slices/auth.slice.js";
import {
  LogoutOutlinedIcon,
  EditOutlinedIcon,
  BlockIcon,
  ShieldIcon,
  SearchIcon,
  PersonIcon,
  PersonAddAlt1Icon,
  PeopleIcon,
} from "../../../utils/icons/export_icons.js";

function MyProfile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, isLoading, isMobile, isChecked } = useSelector(
    (state) => state.auth
  );
  const { badgeOfPendingRequests } = useSelector((state) => state.user);

  const [isPending, startTransition] = useTransition();

  const logoutApiFunc = async () => {
    startTransition(async () => {
      try {
        const response = await logoutApi();
        toast.success(response?.data?.message);
        dispatch(setUser(null));
        dispatch(setIsLoggedIn(false));
        localStorage.setItem("allowFetch", false);
        navigate("/");
      } catch (error) {
        console.error("Error during logout:", error);
        toast.error("Failed to log out. Please try again.");
      }
    });
  };

  const classList =
    "flex items-center justify-start btn w-20 sm:w-full btn-ghost sm:text-xl";

  if (isPending) return <Loading />;
  
  return (
    <div className="flex bg-base-200 w-full h-full rounded-2xl">
      {/* Sidebar Section */}
      <div className="card bg-base-300 rounded-2xl  mr-1 sm:w-1/5 w-3/12 flex-grow">
        <div className="flex w-full h-full flex-col">
          {/* Image Container (1/10th height) */}

          {!isMobile && (
            <div className="absolute z-10 ml-1 mt-1">
              <ThemeToggle
                handleToggle={(e) =>
                  handleToggle(e, dispatch, setTheme, setIsChecked)
                }
                isChecked={isChecked}
              />
            </div>
          )}

          <div className="card bg-base-300 rounded-2xl h-[12%] sm:h-[25%] flex items-center justify-center">
            <div className="btn-circle avatar sm:h-32 h-12 sm:w-32 w-12">
              <img
                src={user?.avatar?.url}
                alt=""
                className="object-cover rounded-full"
              />
            </div>
          </div>

          <div className="divider my-0"></div>

          {/* Options Container (9/10th height) */}
          <div className="card bg-base-300 rounded-2xl h-[88%] sm:h-[75%] flex items-center">
            <ul className="flex flex-col w-full items-center">
              <li className={`${classList}`}>
                <NavLink
                  to={"edit"}
                  className={({ isActive }) =>
                    isActive ? "" : "text-slate-500"
                  }
                >
                  <EditOutlinedIcon />
                  Profile
                </NavLink>
              </li>
              <li className={classList}>
                <NavLink
                  to={"mumbles"}
                  className={({ isActive }) =>
                    isActive ? "" : "text-slate-500"
                  }
                >
                  <ShieldIcon />
                  {`${isMobile ? "" : "My"} Mumbles`}
                </NavLink>
              </li>
              <li className={`${classList} mb-2 sm:mb-0`}>
                <NavLink
                  to={"friends/list"}
                  className={({ isActive }) =>
                    isActive ? "" : "text-slate-500"
                  }
                >
                  <PeopleIcon />
                  {`${isMobile ? "" : "My"} Friends`}
                </NavLink>
              </li>
              <li className={`${classList} mb-2 sm:mb-0 relative`}>
                {badgeOfPendingRequests != 0 && (
                  <span className="absolute -top-1 left-2 bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center sm:text-sm">
                    {badgeOfPendingRequests}
                  </span>
                )}
                <NavLink
                  to={"friends/requests"}
                  className={({ isActive }) =>
                    isActive ? "" : "text-slate-500"
                  }
                >
                  <PersonAddAlt1Icon />
                  {`${isMobile ? "" : "Friend"} Requests`}
                </NavLink>
              </li>

              <li className={`${classList} mb-2 sm:mb-0`}>
                <NavLink
                  to={"blocked-users"}
                  className={({ isActive }) =>
                    isActive ? "" : "text-slate-500"
                  }
                >
                  <BlockIcon />
                  {`Blocked${isMobile ? "" : " Users"}`}
                </NavLink>
              </li>
              <li className={`${classList}`}>
                <NavLink
                  to={"find-users"}
                  className={({ isActive }) =>
                    isActive ? "" : "text-slate-500"
                  }
                >
                  <SearchIcon />
                  {`Find ${isMobile ? "" : "Users"}`}
                </NavLink>
              </li>
              <li className={`${classList}`}>
                <NavLink
                  to={"account"}
                  className={({ isActive }) =>
                    isActive ? "" : "text-slate-500"
                  }
                >
                  <PersonIcon />
                  Account
                </NavLink>
              </li>
              <li className={`${classList} bg-red-800 hover:bg-red-500`}>
                <button onClick={logoutApiFunc}>
                  <LogoutOutlinedIcon />
                  {!isMobile && "Logout"}
                </button>
              </li>
              {isMobile && (
                <li>
                  <div className="text-center sm:mt-6 mt-2">
                    <ThemeToggle
                      handleToggle={(e) =>
                        handleToggle(e, dispatch, setTheme, setIsChecked)
                      }
                      isChecked={isChecked}
                    />
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="card bg-base-300 rounded-2xl sm:w-4/5 w-9/12 flex-grow">
        {isLoading ? <p>Loading...</p> : <Outlet />}
      </div>
    </div>
  );
}

export default MyProfile;
