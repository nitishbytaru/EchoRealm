"use client";

import React, { RefObject } from "react";
import { useSelector } from "react-redux";
import { ChatMessage, DaySeparator, groupMessages } from "@/components/chat/ChatMessage";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import OlderMessagesLoader from "@/components/chat/OlderMessagesLoader";
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
    <div className="relative flex min-h-0 flex-grow flex-col overflow-hidden">
      <div aria-hidden="true" className="nb-dotgrid pointer-events-none absolute inset-0 opacity-50" />
      <div
        role="log"
        aria-label="EchoShout posts"
        aria-live="polite"
        className="relative min-h-0 flex-grow overflow-y-auto px-4 pt-4 pb-1 hide-scrollBar"
        ref={shoutScrollRef}
      >
        {gettingOldMessages && <OlderMessagesLoader label="Digging up older shouts…" />}
        {groupMessages(messages || [], (m: any) => m.sender, (m: any) => m.updatedAt).map(({ message: msg, dayLabel, isFirst, isLast }, index) => (
          <React.Fragment key={msg._id || index}>
            {dayLabel && <DaySeparator label={dayLabel} />}
            <ChatMessage
              text={msg.message}
              prefix={msg.mentions?.length ? msg.mentions.map((mention: any) => `@${mention?.username}`).join(" ") : undefined}
              imageUrl={msg.attachments?.[0]?.url}
              time={msg.updatedAt}
              isMe={msg.sender === user?.username}
              senderName={msg.sender}
              isFirst={isFirst}
              isLast={isLast}
            />
          </React.Fragment>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatHistoryBox;
