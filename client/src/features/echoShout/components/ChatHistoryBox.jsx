/* eslint-disable react/prop-types */
import MessageBubble from "../components/MessageBubble.jsx";
import { useAutoScroll } from "../../../hooks/useAutoScroll.js";
import LoadingSpinner from "../../../components/LoadingSpinner.jsx";

function ChatHistoryBox({
  shoutScrollRef,
  messages,
  gettingOldMessages,
  shouldScrollToBottom,
}) {
  const messagesEndRef = useAutoScroll(messages, shouldScrollToBottom);

  return (
    <div className="flex-grow bg-base-200 sm:p-4 mx-2 sm:mx-4 rounded-xl">
      <div
        className="sm:max-h-[500px] max-h-[450px] overflow-y-auto"
        ref={shoutScrollRef}
      >
        {gettingOldMessages && <LoadingSpinner />}
        {messages?.map((msg, index) => (
          <MessageBubble key={index} {...msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

export default ChatHistoryBox;
