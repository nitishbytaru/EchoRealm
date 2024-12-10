/* eslint-disable react/prop-types */
import moment from "moment";

function MessageBubble({ messages, user }) {
  return (
    <div
      className={`chat ${
        messages?.sender !== user?._id ? "chat-start" : "chat-end"
      }`}
    >
      <div className="chat-bubble ">
        {messages?.attachments?.url ? null : (
          <img
            src={messages?.attachments[0]?.url}
            alt=""
            className={`${
              messages?.attachments[0]?.url
                ? "w-72 h-40 object-cover rounded-lg mb-2"
                : ""
            }`}
          />
        )}

        {messages?.message}
      </div>
      <div className="chat-footer opacity-50 mt-1">
        <time className="text-xs opacity-50">
          {moment(messages?.createdAt).fromNow()}
        </time>
      </div>
    </div>
  );
}

export default MessageBubble;
