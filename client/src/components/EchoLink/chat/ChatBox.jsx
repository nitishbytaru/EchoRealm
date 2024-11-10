import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import MessageBar from "../../ui/MessageBar";
import {
  MoreVertSharpIcon,
  ArrowBackIosIcon,
} from "../../../heplerFunc/exportIcons.js";
import { sendEchoLinkMessage } from "../../../api/echoLinkApi.js";
import {
  addPrivateMessage,
  addToMyPrivateChatRooms,
  setSelectedUser,
} from "../../../app/slices/echoLinkSlice.js";
import socket from "../../../sockets/socket.js";
import { useAutoScroll } from "../../../hooks/useAutoScroll.js";

function ChatBox() {
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { selectedUser, privateMessages } = useSelector(
    (state) => state.echoLink
  );

  const messagesEndRef = useAutoScroll(privateMessages);

  const [echoLinkMessageData, setEchoLinkMessageData] = useState(null);

  useEffect(() => {
    // Listen for both socket events in one useEffect
    socket.on("send_latest_echoLink_message", (latestEchoLinkMessage) => {
      dispatch(addToMyPrivateChatRooms(latestEchoLinkMessage));
      dispatch(addPrivateMessage(latestEchoLinkMessage.latestMessage));
    });

    socket.on("new_privte_message_received", (message) => {
      if (
        message?.uniqueChatId.includes(user?._id) &&
        message?._id != user._id
      ) {
        dispatch(addToMyPrivateChatRooms(message));
      }
    });

    // Cleanup on component unmount
    return () => {
      socket.off("send_latest_echoLink_message");
      socket.off("new_privte_message_received");
    };
  }, [dispatch]);

  useEffect(() => {
    if (echoLinkMessageData && !echoLinkMessageData.has("receiver")) {
      echoLinkMessageData.append("receiver", selectedUser?._id);
    }

    const sendMessage = async () => {
      try {
        if (echoLinkMessageData) {
          const response = await sendEchoLinkMessage(echoLinkMessageData);
          dispatch(addToMyPrivateChatRooms(response?.data?.receiverData));
        }
      } catch (error) {
        console.log(error);
      } finally {
        setEchoLinkMessageData(null);
      }
    };

    sendMessage();
  }, [dispatch, echoLinkMessageData, selectedUser?._id]);

  return (
    <>
      {!selectedUser ? (
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
                <button
                  className="p-0 sm:hidden btn btn-sm z-10"
                  onClick={() => dispatch(setSelectedUser(null))}
                >
                  <ArrowBackIosIcon />
                </button>
                <div className="w-10 rounded-full">
                  <img src={selectedUser?.avatar?.url} alt="User avatar" />
                </div>
                <p className="ml-2 flex items-center">
                  {selectedUser?.username}
                </p>
              </div>
            </div>
            <div className="flex-none">
              <details className="dropdown dropdown-end">
                <summary className="btn btn-sm bg-base-100 rounded-full">
                  <MoreVertSharpIcon />
                </summary>
                <ul className="menu dropdown-content bg-base-200 rounded-box z-[1] p-2 w-56 shadow mt-2">
                  <li>
                    <p>Clear chat</p>
                  </li>
                  <li>
                    <p>Delete friend</p>
                  </li>
                </ul>
              </details>
            </div>
          </div>

          {/* Chat area */}
          <div className="flex-1 overflow-y-auto bg-base-100 mt-2 p-2 rounded-xl">
            <div className="h-full">
              <div className="flex-1 overflow-y-auto">
                {privateMessages?.map((messages, index) => (
                  <div
                    key={index}
                    className={`chat ${
                      messages?.sender !== user?._id ? "chat-start" : "chat-end"
                    }`}
                  >
                    <div className="chat-bubble">
                      {/* {messages?.attachments?.url ? null : (
                        <img
                          src={messages?.attachments[0]?.url}
                          alt=""
                          className={`${
                            messages?.attachments[0]?.url
                              ? "w-72 h-40 object-cover rounded-lg mb-2"
                              : ""
                          }`}
                        />
                      )} */}
                      {messages?.message}
                    </div>
                    <div className="chat-footer opacity-50 mt-1">
                      <time className="text-xs opacity-50">
                        {moment(messages?.createdAt).fromNow()}
                      </time>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} /> {/* Reference for auto-scroll */}
              </div>
            </div>
          </div>

          {/* Message bar at the bottom */}
          <MessageBar setMessageData={setEchoLinkMessageData} />
        </div>
      )}
    </>
  );
}

export default ChatBox;
