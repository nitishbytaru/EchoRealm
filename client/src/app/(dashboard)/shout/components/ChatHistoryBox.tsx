"use client";

import React, { RefObject } from "react";
import { useSelector } from "react-redux";
import MessageBubble from "./MessageBubble";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import LoadingSpinner from "@/components/LoadingSpinner";
import { RootState } from "@/store/store";

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
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <div className="flex-grow bg-zinc-900/10 border border-zinc-900 sm:p-4 p-3 rounded-xl overflow-hidden flex flex-col min-h-[400px]">
      <div
        className="flex-grow overflow-y-auto pr-1 hide-scrollBar max-h-[500px]"
        ref={shoutScrollRef}
      >
        {gettingOldMessages && <LoadingSpinner />}
        {messages?.map((msg, index) => (
          <MessageBubble key={msg._id || index} {...msg} isMe={msg.sender === user?.username} />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatHistoryBox;
