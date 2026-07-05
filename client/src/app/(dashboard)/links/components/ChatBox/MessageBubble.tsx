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
    <div className={`flex flex-col mb-3 animate-scale-in ${isOwnMessage ? "items-end" : "items-start"}`}>
      <div
        className={`max-w-[70%] rounded-xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap break-words border-0 ${
          isOwnMessage
            ? "bg-indigo-600 text-white rounded-br-none shadow-sm shadow-indigo-950/20"
            : "rounded-bl-none"
        }`}
        style={
          !isOwnMessage
            ? {
                background: "var(--background)",
                boxShadow:
                  "var(--nm-raised, 4px 4px 10px rgba(0,0,0,0.12), -2px -2px 6px rgba(255,255,255,0.7))",
                color: "var(--foreground)",
              }
            : undefined
        }
      >
        {attachmentUrl && (
          <div
            className="mb-2 max-w-full overflow-hidden rounded-md"
            style={
              !isOwnMessage
                ? {
                    boxShadow:
                      "var(--nm-inset, inset 0 2px 6px rgba(0,0,0,0.1))",
                  }
                : undefined
            }
          >
            <img
              src={attachmentUrl}
              alt="Attachment"
              className="w-full h-auto max-h-60 object-cover hover:scale-102 transition-transform duration-300"
            />
          </div>
        )}

        <p>{messages?.message}</p>
      </div>

      <span className="text-[9px] text-muted-foreground mt-1.5 px-1 font-medium">
        {moment(messages?.createdAt).fromNow()}
      </span>
    </div>
  );
};

export default MessageBubble;
