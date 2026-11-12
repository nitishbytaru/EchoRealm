"use client";

import React from "react";
import moment from "moment";
import { User } from "@/store/slices/auth.slice";

interface MessageBubbleProps {
  messages: any;
  user: User | null;
  senderName?: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ messages, user, senderName }) => {
  const isOwnMessage = messages?.sender === user?._id;

  const hasAttachments = messages?.attachments && messages?.attachments.length > 0;
  const attachmentUrl = hasAttachments ? messages.attachments[0]?.url : null;

  return (
    <div className={`flex flex-col mb-4 animate-scale-in ${isOwnMessage ? "items-end" : "items-start"}`}>
      {senderName && !isOwnMessage && (
        <span className="mb-1 px-1 text-xs font-bold text-muted-foreground">@{senderName}</span>
      )}
      <div
        className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-2.5 text-[0.95rem] leading-relaxed whitespace-pre-wrap break-words border-[3px] border-[var(--nb-border-color)] font-medium ${
          isOwnMessage
            ? "bg-primary text-on-color rounded-br-md shadow-[var(--nb-shadow-sm)]"
            : "bg-card text-foreground rounded-bl-md shadow-[var(--nb-shadow-sm)]"
        }`}
      >
        {attachmentUrl && (
          <div className="mb-2 max-w-full overflow-hidden rounded-xl border-[2px] border-[var(--nb-border-color)]">
            <img
              src={attachmentUrl}
              alt={senderName ? `Image from ${senderName}` : "Shared image"}
              loading="lazy"
              decoding="async"
              className="w-full h-auto max-h-60 object-cover motion-safe:hover:scale-102 transition-transform duration-300"
            />
          </div>
        )}

        <p>{messages?.message}</p>
      </div>

      <span title={moment(messages?.createdAt).format("LLL")} className="text-xs text-muted-foreground mt-1.5 px-1 font-bold">
        {moment(messages?.createdAt).fromNow()}
      </span>
    </div>
  );
};

export default MessageBubble;
