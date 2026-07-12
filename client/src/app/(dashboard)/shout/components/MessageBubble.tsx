"use client";

import React from "react";
import moment from "moment";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

interface Attachment {
  url?: string;
  public_id?: string;
}

interface Mention {
  _id: string;
  username: string;
}

interface MessageBubbleProps {
  sender: string;
  attachments: Attachment[];
  mentions: Mention[];
  message: string;
  updatedAt: string;
  isMe: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = React.memo(({
  sender,
  attachments,
  mentions,
  message,
  updatedAt,
  isMe,
}) => {
  return (
    <div className={`flex flex-col mb-4 animate-scale-in ${isMe ? "items-end" : "items-start"}`}>
      <span className="text-xs text-muted-foreground font-bold mb-1 px-1">@{sender}</span>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 border-[3px] border-[var(--nb-border-color)] ${
          isMe
            ? "bg-primary text-primary-foreground rounded-tr-none shadow-[4px_4px_0px_var(--nb-shadow-color)]"
            : "bg-card text-foreground rounded-tl-none shadow-[4px_4px_0px_var(--nb-shadow-color)]"
        }`}
      >
        {attachments && attachments[0]?.url && (
          <div className="relative mb-2 rounded-xl overflow-hidden border-[2px] border-[var(--nb-border-color)] bg-muted max-w-[200px]">
            <img
              src={attachments[0].url}
              alt="attachment"
              className="object-cover w-full h-auto max-h-[160px] rounded-lg transition-transform hover:scale-102"
              loading="lazy"
            />
          </div>
        )}
        <div className="flex flex-wrap items-center gap-1.5">
          {mentions && mentions.length > 0 && (
            <span className="text-sm font-bold text-secondary">
              {mentions.map((mention) => `@${mention?.username}`).join(" ")}{" "}
            </span>
          )}
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words font-medium">{message}</p>
        </div>
      </div>
      <span className="text-[10px] text-muted-foreground mt-1.5 px-1 font-bold">{moment(updatedAt).fromNow()}</span>
    </div>
  );
});

MessageBubble.displayName = "MessageBubble";

export default MessageBubble;
