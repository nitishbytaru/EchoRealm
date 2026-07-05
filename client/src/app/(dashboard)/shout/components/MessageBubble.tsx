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
    <div className={`flex flex-col mb-3 animate-scale-in ${isMe ? "items-end" : "items-start"}`}>
      <span className="text-[10px] text-zinc-550 font-semibold mb-1 px-1">@{sender}</span>
      <div
        className={`max-w-[80%] rounded-xl px-3.5 py-2 shadow-sm border ${
          isMe
            ? "bg-indigo-650 border-indigo-700 text-zinc-50 rounded-tr-none shadow-indigo-950/20"
            : "bg-zinc-900 border-zinc-800 text-zinc-200 rounded-tl-none shadow-black/10"
        }`}
      >
        {attachments && attachments[0]?.url && (
          <div className="relative mb-2 rounded-md overflow-hidden border border-zinc-800 bg-zinc-950 max-w-[200px]">
            <img
              src={attachments[0].url}
              alt="attachment"
              className="object-cover w-full h-auto max-h-[160px] rounded-md transition-transform hover:scale-102"
              loading="lazy"
            />
          </div>
        )}
        <div className="flex flex-wrap items-center gap-1.5">
          {mentions && mentions.length > 0 && (
            <span className="text-xs font-semibold text-indigo-300">
              {mentions.map((mention) => `@${mention?.username}`).join(" ")}{" "}
            </span>
          )}
          <p className="text-xs leading-relaxed whitespace-pre-wrap break-words">{message}</p>
        </div>
      </div>
      <span className="text-[9px] text-zinc-550 mt-1.5 px-1 font-medium">{moment(updatedAt).fromNow()}</span>
    </div>
  );
});

MessageBubble.displayName = "MessageBubble";

export default MessageBubble;
