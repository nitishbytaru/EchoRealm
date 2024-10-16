import React from "react";
import messages from "../../temp/data/sampleMessages";
import MessageBar from "../../components/ui/MessageBar";

function EchoShout() {
  return (
    <div className="h-full flex flex-col bg-base-100">
      {/* Announcements section that grows and is scrollable if needed */}
      <div className="flex-grow overflow-y-auto bg-base-200 sm:p-4 mx-2 sm:mx-4 hide-scrollBar rounded-xl">
        {messages.map((message, index) => (
          <div className="chat chat-start" key={index}>
            <div className="chat-header text-sm sm:text-base">{message.from}</div>
            <div className="chat-bubble text-xs sm:text-sm">{message.text}</div>
            <div className="chat-footer opacity-50">
              <time className="text-xs opacity-50">2 hours ago</time>
            </div>
          </div>
        ))}
      </div>

      {/* MessageBar at the bottom */}
      <div className="flex-none bg-base-100 sm:p-4">
        <MessageBar />
      </div>
    </div>
  );
}

export default EchoShout;
