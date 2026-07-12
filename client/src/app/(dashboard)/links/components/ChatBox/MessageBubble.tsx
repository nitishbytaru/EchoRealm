"use client";

import React from "react";
import moment from "moment";
import { User } from "@/store/slices/auth.slice";

interface MessageBubbleProps {
  messages: any;
  user: User | null;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ messages, user }) => {
  const isOwnMessage = messages?.sender === user?._id;

  const hasAttachments = messages?.attachments && messages?.attachments.length > 0;
  const attachmentUrl = hasAttachments ? messages.attachments[0]?.url : null;

  return (
    <div className={`flex flex-col mb-4 animate-scale-in ${isOwnMessage ? "items-end" : "items-start"}`}>
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words border-[3px] border-[var(--nb-border-color)] font-medium ${
          isOwnMessage
            ? "bg-primary text-primary-foreground rounded-br-none shadow-[4px_4px_0px_var(--nb-shadow-color)]"
            : "bg-card text-foreground rounded-bl-none shadow-[4px_4px_0px_var(--nb-shadow-color)]"
        }`}
      >
        {attachmentUrl && (
          <div className="mb-2 max-w-full overflow-hidden rounded-xl border-[2px] border-[var(--nb-border-color)]">
            <img
              src={attachmentUrl}
              alt="Attachment"
              className="w-full h-auto max-h-60 object-cover hover:scale-102 transition-transform duration-300"
            />
          </div>
        )}

        <p>{messages?.message}</p>
      </div>

      <span className="text-[10px] text-muted-foreground mt-1.5 px-1 font-bold">
        {moment(messages?.createdAt).fromNow()}
      </span>
    </div>
  );
};

export default MessageBubble;
