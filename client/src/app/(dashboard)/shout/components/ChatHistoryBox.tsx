"use client";

import React, { RefObject } from "react";
import MessageBubble from "./MessageBubble";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import LoadingSpinner from "@/components/LoadingSpinner";

interface ChatHistoryBoxProps {
  shoutScrollRef: RefObject<HTMLDivElement | null>;
  messages: any[];
  gettingOldMessages: boolean;
  shouldScrollToBottom: boolean;
}

export const ChatHistoryBox: React.FC<ChatHistoryBoxProps> = ({
  shoutScrollRef,
  messages,
  gettingOldMessages,
  shouldScrollToBottom,
}) => {
  const messagesEndRef = useAutoScroll(messages, shouldScrollToBottom);

  return (
    <div className="flex-grow bg-slate-900/40 border border-slate-900 sm:p-6 p-4 rounded-2xl backdrop-blur-md overflow-hidden flex flex-col min-h-[400px]">
      <div
        className="flex-grow overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent max-h-[500px]"
        ref={shoutScrollRef}
      >
        {gettingOldMessages && <LoadingSpinner />}
        {messages?.map((msg, index) => (
          <MessageBubble key={msg._id || index} {...msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatHistoryBox;
