import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import MessageBar from "../../components/ui/MessageBar";
import { getMessages } from "../../api/echoShoutApi";
import { setLoading } from "../../app/slices/authSlice.js";
import { setMessages } from "../../app/slices/echoShoutSlice.js";

function EchoShout() {
  const { isLoggedIn, user } = useSelector((state) => state.auth);
  const { messages } = useSelector((state) => state.echoShout);

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await getMessages();
        dispatch(setMessages(response?.data?.messages));
      } catch (error) {
        console.log(error);
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchMessages();
  }, [dispatch]);

  return (
    <div className="h-full flex flex-col bg-base-100">
      {/* Announcements section that grows and is scrollable if needed */}
      <div className="flex-grow overflow-y-auto bg-base-200 sm:p-4 mx-2 sm:mx-4 rounded-xl">
        {messages?.map(({ message, sender, updatedAt }, index) => (
          <div
            className={`chat ${
              sender?._id == user?._id ? "chat-end" : "chat-start"
            }`}
            key={index}
          >
            <div className="chat-header text-sm sm:text-base">
              @{sender.username}
            </div>
            <div className="chat-bubble sm:text-sm">{message}</div>
            <div className="chat-footer opacity-50">
              <time className="text-xs opacity-50">
                {moment(updatedAt).fromNow()}
              </time>
            </div>
          </div>
        ))}
      </div>

      {/* MessageBar at the bottom */}
      <div>
        {isLoggedIn && (
          <div className="flex-none bg-base-100 sm:p-4">
            <MessageBar />
          </div>
        )}
      </div>
    </div>
  );
}

export default EchoShout;
