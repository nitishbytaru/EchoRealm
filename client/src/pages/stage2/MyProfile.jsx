import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { handleToggle } from "../../heplerFunc/microFuncs";
import ThemeToggle from "../../components/ui/ThemeToggle";
import {
  setTheme,
  setIsChecked,
  setUser,
  setIsLoggedIn,
} from "../../app/slices/authSlice";
import {
  LogoutOutlinedIcon,
  EditOutlinedIcon,
  BlockIcon,
  PersonAddIcon,
  SearchIcon,
  PersonIcon,
} from "../../heplerFunc/exportIcons";
import { logout } from "../../api/userApi";
import toast from "react-hot-toast";

function MyProfile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, isMobile, isChecked } = useSelector((state) => state.auth);

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

  const classList = "btn w-20 sm:w-full btn-ghost sm:text-xl";

  return (
    <div className="flex bg-base-200 w-full h-full rounded-2xl">
      {/* Sidebar Section */}
      <div className="card bg-base-300 rounded-2xl m-2 sm:w-1/5 w-3/12 flex-grow">
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
            <ul className="flex flex-col">
              <li className={`${classList}`}>
                <Link>
                  <EditOutlinedIcon />
                  profile
                </Link>
              </li>
              <li className={`${classList}`}>
                <Link>
                  <PersonAddIcon />
                  Requests
                </Link>
              </li>
              <li className={`${classList} mb-2 sm:mb-0`}>
                <Link>
                  <BlockIcon />
                  {`block ${isMobile ? "" : "users"}`}
                </Link>
              </li>
              <li className={`${classList}`}>
                <Link>
                  <SearchIcon />
                  {`find ${isMobile ? "" : "users"}`}
                </Link>
              </li>
              <li className={`${classList}`}>
                <Link>
                  <PersonIcon />
                  account
                </Link>
              </li>
              <li className={`${classList} bg-red-800 hover:bg-red-500`}>
                <button onClick={handleLogout}>
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
      <div className="card bg-base-300 rounded-2xl my-2 mr-1 sm:w-4/5 w-9/12 flex-grow flex items-center justify-center">
        Content
      </div>
    </div>
  );
}

export default MyProfile;
