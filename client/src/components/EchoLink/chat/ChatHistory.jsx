import React, { useEffect, useRef } from "react";
import messages from "../../../temp/data/sampleMessages";

function ChatHistory() {
  const chatEndRef = useRef(null); // Ref to track the end of the chat history
  const senderId = parseInt(localStorage.getItem("sendId"), 10); // Current user (sender)
  const receiverId = parseInt(localStorage.getItem("userId"), 10); // Selected chat user (receiver)

  // Function to scroll to the bottom
  const scrollToBottom = () => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Scroll to the bottom when the component mounts or messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]); //when ever a new user is selected from the userlist then run this hook once again

  return (
    <div className="flex-1 overflow-y-auto">
      {messages
        .filter(
          (message) =>
            (message.from === senderId && message.to === receiverId) ||
            (message.from === receiverId && message.to === senderId)
        )
        .map((message, index) => (
          <div
            key={index}
            className={`chat ${
              message.from === senderId ? "chat-start" : "chat-end"
            }`}
          >
            <div className="chat-bubble">{message.text}</div>
          </div>
        ))}
      <div ref={chatEndRef}></div>
    </div>
  );
}

export default ChatHistory;
