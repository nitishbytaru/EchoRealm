/* eslint-disable react/prop-types */
import toast, { LoaderIcon } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState, useTransition } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import socket from "../../../sockets/socket.js";
import MessageBar from "../../../components/MessageBar.jsx";
import { useAutoScroll } from "../../../hooks/useAutoScroll.js";
import { searchUserByIdApi } from "../../profile/api/user.api.js";
import LoadingSpinner from "../../../components/LoadingSpinner.jsx";
import { handleRemoveOrBlockMyFriendApi } from "../../profile/api/friends.api.js";
import {
  clearChatApi,
  deleteChatRoomApi,
  getGroupChatDetailsApi,
  getPrivateMessagesApi,
  sendEchoLinkMessageApi,
  sendGroupChatMessageApi,
} from "../api/echo_link.api.js";
import {
  MoreVertSharpIcon,
  ArrowBackIosIcon,
} from "../../../utils/icons/export_icons.js";
import {
  addPrivateMessage,
  addToMyPrivateChatRooms,
  removeFromMyPrivateChatRooms,
  setLatestMessageAsRead,
  setPrivateMessages,
} from "../slices/echo_link.slice.js";
import {
  createUniquechatRoom,
  markAsRead,
} from "../../../utils/heplers/micro_funcs.js";
import MessageBubble from "./MessageBubble.jsx";

function ChatBox({
  scrollRef,
  shouldScrollToBottom,
  setShouldScrollToBottom,
  gettingOldMessages,
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { recieverId } = useParams();

  const { user } = useSelector((state) => state.auth);
  const { privateMessages } = useSelector((state) => state.echoLink);

  const messagesEndRef = useAutoScroll(privateMessages, shouldScrollToBottom);

  const [selectedUser, setSelecedUser] = useState(null);
  const uniqueChatRoom = createUniquechatRoom(user?._id, recieverId);
  const [echoLinkMessageData, setEchoLinkMessageData] = useState(null);

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const getRecieverDataByIdFunc = async () => {
      try {
        let response = await searchUserByIdApi(recieverId);
        if (!response?.data?.searchedUser) {
          response = await getGroupChatDetailsApi(recieverId);
          setSelecedUser(response?.data?.groupDetails);
        } else {
          setSelecedUser(response?.data?.searchedUser);
        }
      } catch (error) {
        console.error("Error fetching receiver data:", error);
        toast.error("Failed to fetch receiver details.");
      }
    };

    if (recieverId) {
      startTransition(() => {
        getRecieverDataByIdFunc();
      });
    }
  }, [recieverId]);

  useEffect(() => {
    const handleLatestEchoLinkMessage = (latestEchoLinkMessage) => {
      const { latestMessage } = latestEchoLinkMessage;

      if (recieverId === latestMessage?.sender) {
        markAsRead(dispatch, setLatestMessageAsRead, latestEchoLinkMessage);
      }

      dispatch(addToMyPrivateChatRooms(latestEchoLinkMessage));
      dispatch(addPrivateMessage(latestMessage));
      setShouldScrollToBottom(true);
    };

    const handleNewGroupChatMessage = (groupChatMessage) => {
      dispatch(addPrivateMessage(groupChatMessage));
    };

    socket.on("send_latest_echoLink_message", handleLatestEchoLinkMessage);
    socket.on("new_groupChat_Message", handleNewGroupChatMessage);

    return () => {
      socket.off("send_latest_echoLink_message");
      socket.off("new_groupChat_Message");
    };
  }, [dispatch, recieverId, setShouldScrollToBottom, user._id]);

  useEffect(() => {
    if (echoLinkMessageData && !echoLinkMessageData.has("receiver")) {
      echoLinkMessageData.append("receiver", recieverId);
    }

    const sendMessage = () => {
      try {
        startTransition(async () => {
          if (!echoLinkMessageData) return;

          const response = selectedUser?.groupName
            ? await sendGroupChatMessageApi(echoLinkMessageData)
            : await sendEchoLinkMessageApi(echoLinkMessageData);

          if (response.response) {
            return toast.error(response.response.data.message);
          }

          if (!selectedUser?.groupName) {
            dispatch(addToMyPrivateChatRooms(response?.data?.receiverData));
          }
        });
      } catch (error) {
        console.error("Error sending message:", error);
      } finally {
        setEchoLinkMessageData(null);
      }
    };

    if (echoLinkMessageData) sendMessage();
  }, [dispatch, echoLinkMessageData, recieverId, selectedUser?.groupName]);

  useEffect(() => {
    if (recieverId) {
      const uniqueRoomId = createUniquechatRoom(recieverId, user?._id);
      startTransition(async () => {
        const response = await getPrivateMessagesApi(uniqueRoomId);
        if (response?.data?.messages) {
          dispatch(setPrivateMessages(response.data.messages));
        }
      });
    }
  }, [dispatch, recieverId, user?._id]);

  const blockSender = () => {
    const senderId = recieverId;
    try {
      startTransition(async () => {
        const response = await handleRemoveOrBlockMyFriendApi({
          senderId,
          block: true,
        });

        if (response?.data) {
          toast.success(response.data?.message);
          dispatch(removeFromMyPrivateChatRooms(uniqueChatRoom));
        }
      });
    } catch (error) {
      console.error("Error blocking sender:", error);
      toast.error("Failed to block sender.");
    }
  };

  const clearChat = () => {
    try {
      startTransition(async () => {
        const response = await clearChatApi(uniqueChatRoom);
        dispatch(setPrivateMessages([]));
        if (response?.data?.message) {
          toast.success(response.data.message);
        }
      });
    } catch (error) {
      console.error("Error clearing chat:", error);
      toast.error("Failed to clear the chat.");
    }
  };

  const deleteChatRoom = () => {
    try {
      startTransition(async () => {
        const response = await deleteChatRoomApi(uniqueChatRoom);
        if (response?.data?.message) {
          toast.success(response.data.message);
          dispatch(removeFromMyPrivateChatRooms(uniqueChatRoom));
        }
      });
      navigate("/links");
    } catch (error) {
      console.error("Error deleting chat room:", error);
      toast.error("Failed to delete the chat room.");
    }
  };

  return (
    <>
      {!recieverId ? (
        <div className="h-full flex justify-center items-center text-center bg-base-100 rounded-xl">
          <p className="text-xl font-semibold text-gray-600">
            Select a user to open chat
          </p>
        </div>
      ) : (
        <div className="h-full flex flex-col">
          {/* Navbar with dropdown menu */}
          <div className="navbar bg-base-100 rounded-xl flex-none">
            <div className="flex-1">
              <div className="avatar flex items-center">
                {/* Back Button */}
                <Link to={"/"} className="p-0 sm:hidden btn btn-sm z-10">
                  <ArrowBackIosIcon />
                </Link>
                <div className="w-10 rounded-full">
                  <img
                    src={
                      selectedUser?.avatar?.url ||
                      selectedUser?.groupProfile?.url
                    }
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

          {/* Chat area */}
          <div className="flex-1 overflow-y-auto bg-base-100 mt-2 p-2 rounded-xl">
            <div className="h-full">
              <div className="flex-1 overflow-y-auto flex-col">
                <div
                  className="sm:max-h-[450px] max-h-[400px] overflow-y-auto"
                  ref={scrollRef}
                >
                  {gettingOldMessages && <LoadingSpinner />}
                  {privateMessages?.map((messages, index) => (
                    <MessageBubble
                      key={index}
                      messages={messages}
                      user={user}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            </div>
          </div>

          {/* Message bar at the bottom */}
          {isPending ? (
            <div className="w-full flex justify-center items-center">
              <LoaderIcon style={{ width: "40px", height: "40px" }} />
            </div>
          ) : (
            <MessageBar setMessageData={setEchoLinkMessageData} />
          )}
        </div>
      )}
    </>
  );
}

export default ChatBox;
