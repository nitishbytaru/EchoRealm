/* eslint-disable react/prop-types */
import { useParams } from "react-router-dom";
import toast, { LoaderIcon } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState, useTransition } from "react";

import Loading from "../../../components/Loading.jsx";
import socket from "../../../sockets/socket.js";
import MessageBubble from "./ChatBox/MessageBubble.jsx";
import MessageBar from "../../../components/MessageBar.jsx";
import GroupChatNav from "./ChatBox/NavBars/GroupChatNav.jsx";
import { useAutoScroll } from "../../../hooks/useAutoScroll.js";
import PrivateChatNav from "./ChatBox/NavBars/PrivateChatNav.jsx";
import { searchUserByIdApi } from "../../profile/api/user.api.js";
import LoadingSpinner from "../../../components/LoadingSpinner.jsx";
import {
  getGroupChatDetailsApi,
  getPrivateMessagesApi,
  sendEchoLinkMessageApi,
  sendGroupChatMessageApi,
} from "../api/echo_link.api.js";
import {
  addPrivateMessage,
  addToMyPrivateChatRooms,
  setLatestMessageAsRead,
  setPrivateMessages,
  setSelectedChat,
} from "../slices/echo_link.slice.js";
import {
  createUniquechatRoom,
  markAsRead,
} from "../../../utils/heplers/micro_funcs.js";

function ChatBox({
  scrollRef,
  shouldScrollToBottom,
  setShouldScrollToBottom,
  gettingOldMessages,
}) {
  const dispatch = useDispatch();
  const { recieverId } = useParams();

  const { user } = useSelector((state) => state.auth);
  const { selectedChat, privateMessages } = useSelector(
    (state) => state.echoLink
  );

  const messagesEndRef = useAutoScroll(privateMessages, shouldScrollToBottom);

  const [echoLinkMessageData, setEchoLinkMessageData] = useState(null);

  const [isPendingOperation, setIsPendingOperation] = useState(false);
  const [isPendingSendMessage, startTransitionSendMessage] = useTransition();
  const [isPendingGetMessage, startTransitionGetMessage] = useTransition();

  useEffect(() => {
    const getRecieverDataByIdFunc = async () => {
      try {
        let response = await searchUserByIdApi(recieverId);
        if (!response?.data?.searchedUser) {
          response = await getGroupChatDetailsApi(recieverId);
          dispatch(setSelectedChat(response?.data?.groupDetails));
        } else {
          dispatch(setSelectedChat(response?.data?.searchedUser));
        }
      } catch (error) {
        console.error("Error fetching receiver data:", error);
        toast.error("Failed to fetch receiver details.");
      }
    };

    if (recieverId) {
      startTransitionGetMessage(() => {
        getRecieverDataByIdFunc();
      });
    }
  }, [dispatch, recieverId]);

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
        startTransitionSendMessage(async () => {
          if (!echoLinkMessageData) return;

          const response = selectedChat?.groupName
            ? await sendGroupChatMessageApi(echoLinkMessageData)
            : await sendEchoLinkMessageApi(echoLinkMessageData);

          if (response.response) {
            return toast.error(response.response.data.message);
          }

          if (!selectedChat?.groupName) {
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
  }, [dispatch, echoLinkMessageData, recieverId, selectedChat?.groupName]);

  useEffect(() => {
    if (recieverId) {
      const uniqueRoomId = createUniquechatRoom(recieverId, user?._id);
      startTransitionGetMessage(async () => {
        const response = await getPrivateMessagesApi(uniqueRoomId);
        if (response?.data?.messages) {
          dispatch(setPrivateMessages(response.data.messages));
        } else {
          const groupResponse = await getGroupChatDetailsApi(recieverId);
          const groupDetails = groupResponse?.data?.groupDetails;

          if (groupDetails?._id) {
            const { _id, messages } = groupDetails;
            socket.emit("joinGroupChat", _id);
            dispatch(setPrivateMessages(messages));
          }
        }
      });
    }
  }, [dispatch, recieverId, user?._id]);

  if (isPendingGetMessage) return <Loading />;
  if (isPendingOperation)
    return (
      <div className="h-full flex flex-col justify-center items-center">
        <LoaderIcon style={{ width: "40px", height: "40px" }} />
        <p>Performing operation</p>
      </div>
    );

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
          {selectedChat?.groupName ? (
            <GroupChatNav setIsPendingOperation={setIsPendingOperation} />
          ) : (
            <PrivateChatNav setIsPendingOperation={setIsPendingOperation} />
          )}

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
          {isPendingSendMessage ? (
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
