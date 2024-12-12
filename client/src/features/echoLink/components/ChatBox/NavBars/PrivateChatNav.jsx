/* eslint-disable react/prop-types */
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { clearChatApi, deleteChatRoomApi } from "../../../api/echo_link.api";
import { createUniquechatRoom } from "../../../../../utils/heplers/micro_funcs";
import { handleRemoveOrBlockMyFriendApi } from "../../../../profile/api/friends.api";
import {
  MoreVertSharpIcon,
  ArrowBackIosIcon,
} from "../../../../../utils/icons/export_icons";
import {
  removeFromMyPrivateChatRooms,
  setPrivateMessages,
} from "../../../slices/echo_link.slice";

function PrivateChatNav({ setIsPendingOperation }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { selectedChat } = useSelector((state) => state.echoLink);

  const uniqueRoomId = createUniquechatRoom(selectedChat?._id, user?._id);

  const clearChat = async () => {
    try {
      setIsPendingOperation(true);
      const response = await clearChatApi(uniqueRoomId);
      dispatch(setPrivateMessages([]));
      if (response?.data?.message) {
        toast.success(response.data.message);
      }
    } catch (error) {
      console.error("Error clearing chat:", error);
      toast.error("Failed to clear the chat.");
    } finally {
      setIsPendingOperation(false);
    }
  };

  const deleteChatRoom = async () => {
    try {
      setIsPendingOperation(true);
      const response = await deleteChatRoomApi(uniqueRoomId);
      if (response?.data?.message) {
        toast.success(response.data.message);
        dispatch(removeFromMyPrivateChatRooms(uniqueRoomId));
      }
      navigate("/links");
    } catch (error) {
      console.error("Error deleting chat room:", error);
      toast.error("Failed to delete the chat room.");
    } finally {
      setIsPendingOperation(false);
    }
  };

  const blockSender = async () => {
    const senderId = selectedChat?._id;
    try {
      setIsPendingOperation(true);
      const response = await handleRemoveOrBlockMyFriendApi({
        senderId,
        block: true,
      });

      if (response?.data) {
        toast.success(response.data?.message);
        dispatch(removeFromMyPrivateChatRooms(uniqueRoomId));
      }
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
            <img src={selectedChat?.avatar?.url} alt="User avatar" />
          </div>
          <p className="ml-2 flex items-center">{selectedChat?.username}</p>
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
