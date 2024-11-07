import { useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { useSelector } from "react-redux";
import {
  EditOutlinedIcon,
  CampaignIcon,
  LogoutOutlinedIcon,
} from "../../heplerFunc/exportIcons";

function NavDrawer({ handleLogout, handleToggle, isChecked }) {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="drawer drawer-end z-10">
      <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        <label
          htmlFor="my-drawer-4"
          className="drawer-button btn btn-circle avatar"
        >
          <div className="w-12 rounded-full">
            <img src={user.avatar.url} alt="User Avatar" />
          </div>
        </label>
      </div>
      <div className="drawer-side">
        <label htmlFor="my-drawer-4" className="drawer-overlay"></label>
        <ul className="menu bg-base-200 text-base-content min-h-full w-80 p-10 flex flex-col">
          <div className="flex-grow">
            <label htmlFor="my-drawer-4" className="drawer-overlay">
              <li className="btn btn-ghost bg-base-300">X</li>
            </label>

            <li className="w-full m-2">
              <button
                className="btn bg-base-300 drawer-overlay rounded-lg text-xl"
                onClick={() => navigate("/edit-profile")}
              >
                <EditOutlinedIcon />
                Edit Details
              </button>
            </li>
            <li className="w-full m-2">
              <button
                className="btn bg-base-300 drawer-overlay rounded-lg text-xl"
                onClick={() => navigate("/echo-shout")}
              >
                <CampaignIcon />
                EchoShout
              </button>
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
              <ThemeToggle handleToggle={handleToggle} isChecked={isChecked} />
            </li>
          </div>
        </ul>
      </div>
    </div>
  );
}

export default NavDrawer;
