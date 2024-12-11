/* eslint-disable react/prop-types */
import moment from "moment";
import { useSelector } from "react-redux";

function MessageBubble({ sender, attachments, mentions, message, updatedAt }) {
  const { user } = useSelector((state) => state.auth);

  return (
    <div
      className={`chat ${
        sender === user?.username ? "chat-end" : "chat-start"
      }`}
    >
      <div className="chat-header text-sm sm:text-base mb-1">@{sender}</div>
      <div className="chat-bubble sm:text-sm p-2">
        {attachments[0]?.url && (
          <img
            src={attachments[0]?.url}
            alt="attachment"
            className="w-20 h-20 sm:w-24 sm:h-24 object-cover mb-2 rounded-lg"
          />
        )}
        <div className="flex items-center justify-center">
          {mentions.length > 0 ? (
            <span className="text-lg font-semibold text-blue-800">{`${mentions?.map(
              (mention) => `@${mention?.username}`
            )} `}</span>
          ) : null}
          <p className="text-lg ml-2">{message}</p>
        </div>
      </div>
      <div className="chat-footer opacity-50 mt-1">
        <time className="text-xs opacity-50">
          {moment(updatedAt).fromNow()}
        </time>
      </div>
    </div>
  );
}

export default MessageBubble;
