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
    <div className="flex min-h-0 flex-grow flex-col overflow-hidden rounded-t-[13px]">
      <div
        role="log"
        aria-label="EchoShout posts"
        aria-live="polite"
        className="min-h-0 flex-grow overflow-y-auto px-3 pt-4 pb-2 sm:px-5 hide-scrollBar"
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
