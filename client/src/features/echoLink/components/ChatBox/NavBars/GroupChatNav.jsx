/* eslint-disable react/prop-types */
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import { leaveFromGroupChatApi } from "../../../api/echo_link.api";
import { truncateMessage } from "../../../../../utils/heplers/micro_funcs";
import {
  MoreVertSharpIcon,
  ArrowBackIosIcon,
} from "../../../../../utils/icons/export_icons";

function PrivateChatNav({ setIsPendingOperation }) {
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { selectedChat } = useSelector((state) => state.echoLink);

  const leaveGroup = async () => {
    try {
      setIsPendingOperation(true);
      const response = await leaveFromGroupChatApi(selectedChat?._id);
      if (response?.data) {
        toast.success(response.data?.message);
      }
      navigate("/links");
    } catch (error) {
      console.error("Error blocking sender:", error);
      toast.error("Failed to block sender.");
    } finally {
      setIsPendingOperation(false);
    }
  };

  return (
    <div className="navbar bg-base-100 rounded-xl flex-none">
      <div className="flex-1">
        <div className="avatar flex items-center">
          {/* Back Button */}
          <Link to={"/"} className="p-0 sm:hidden btn btn-sm z-10">
            <ArrowBackIosIcon />
          </Link>
          <div className="w-10 rounded-full">
            <img src={selectedChat?.groupProfile?.url} alt="User avatar" />
          </div>
        </div>
        <div className="flex flex-col">
          <p className="ml-2 flex items-center">{selectedChat?.groupName}</p>
          <div className="flex">
            {truncateMessage(
              selectedChat?.groupChatRoomMembers?.map((member, index) => {
                return (
                  <p className="text-gray-500" key={index}>
                    {member?.username},
                  </p>
                );
              })
            )}
          </div>
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
            {selectedChat?.admin?._id === user?._id ? (
              <>
                <li>
                  <button
                    className="btn"
                    onClick={() => {
                      document
                        .getElementById("my_modal_addToGroup")
                        .showModal();
                    }}
                  >
                    Add Members
                  </button>
                </li>
                <li>
                  <button
                    className="btn"
                    onClick={() =>
                      document
                        .getElementById("my_modal_removeFromGroup")
                        .showModal()
                    }
                  >
                    Remove Members
                  </button>
                </li>
              </>
            ) : (
              <li className="bg-error">
                <button className="btn btn-error" onClick={leaveGroup}>
                  Leave Group
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default PrivateChatNav;
