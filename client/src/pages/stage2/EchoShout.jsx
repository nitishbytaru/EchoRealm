import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import socket from "../../sockets/socket.js";
import moment from "moment";
import MessageBar from "../../components/ui/MessageBar";
import { getEchoShouts, sendEchoShout } from "../../api/echoShoutApi";
import { setLoading } from "../../app/slices/authSlice.js";
import {
  addEchoShoutMessage,
  setEchoShoutMessages,
} from "../../app/slices/echoShoutSlice.js";

function EchoShout() {
  const messagesEndRef = useRef(null);
  const { isLoggedIn, user } = useSelector((state) => state.auth);
  const { messages } = useSelector((state) => state.echoShout);

  const dispatch = useDispatch();

  useEffect(() => {
    // Listen for new messages
    console.log("hello");
    socket.on("send_latest_echoShout_message", (latestEchoShoutMessage) => {
      dispatch(addEchoShoutMessage(latestEchoShoutMessage));
    });

    // Cleanup on component unmount
    return () => {
      socket.off("receive_message");
    };
  }, [dispatch]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await getEchoShouts();
        dispatch(setEchoShoutMessages(response?.data?.messages || []));
      } catch (error) {
        console.log(error);
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchMessages();
  });

  //these are used to scroll down automatically
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="h-full flex flex-col bg-base-100">
      {/* Announcements section that grows and is scrollable if needed */}
      <div className="flex-grow overflow-y-auto bg-base-200 sm:p-4 mx-2 sm:mx-4 rounded-xl">
        {messages?.map(({ message, sender, updatedAt, attachments }, index) => (
          <div
            className={`chat ${
              sender?._id === user?._id ? "chat-end" : "chat-start"
            }`}
            key={index}
          >
            <div className="chat-header text-sm sm:text-base mb-1">
              @{sender.username}
            </div>
            <div className="chat-bubble sm:text-sm p-2">
              {attachments[0]?.url && (
                <img
                  src={attachments[0]?.url}
                  alt="attachment"
                  className="w-20 h-20 sm:w-24 sm:h-24 object-cover mb-2 rounded-lg"
                />
              )}
              <p className="font-semibold text-base">{message}</p>
            </div>
            <div className="chat-footer opacity-50 mt-1">
              <time className="text-xs opacity-50">
                {moment(updatedAt).fromNow()}
              </time>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* MessageBar at the bottom */}
      <div>
        {isLoggedIn && (
          <div className="flex-none bg-base-100 sm:p-4">
            <MessageBar sendDataToApi={sendEchoShout} />
          </div>
        )}
      </div>
    </div>
  );
}

export default EchoShout;
