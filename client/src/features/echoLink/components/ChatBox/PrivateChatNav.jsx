/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";

import {
  MoreVertSharpIcon,
  ArrowBackIosIcon,
} from "../../../../utils/icons/export_icons";

function PrivateChatNav({ blockSender, deleteChatRoom, clearChat, selectedUser }) {
  return (
    <div className="navbar bg-base-100 rounded-xl flex-none">
      <div className="flex-1">
        <div className="avatar flex items-center">
          {/* Back Button */}
          <Link to={"/"} className="p-0 sm:hidden btn btn-sm z-10">
            <ArrowBackIosIcon />
          </Link>
          <div className="w-10 rounded-full">
            <img
              src={selectedUser?.avatar?.url || selectedUser?.groupProfile?.url}
              alt="User avatar"
            />
          </div>
          <p className="ml-2 flex items-center">
            {selectedUser?.username || selectedUser?.groupName}
          </p>
        </div>
      </div>
      <div className="flex-none">
        <div className="dropdown dropdown-end">
          <div
            role="button"
            tabIndex={0}
            className="btn btn-sm bg-base-100 rounded-full"
          >
            <MoreVertSharpIcon />
          </div>
          <ul
            tabIndex={0}
            className="menu dropdown-content bg-base-200 rounded-box z-[1] p-2 w-56 shadow mt-2"
          >
            <li>
              <button className="btn" onClick={clearChat}>
                Clear chat
              </button>
            </li>
            <li>
              <button className="btn" onClick={deleteChatRoom}>
                Delete ChatRoom
              </button>
            </li>
            <li className="bg-error">
              <button className="btn btn-error" onClick={blockSender}>
                Block User
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default PrivateChatNav;
