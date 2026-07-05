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
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  sender,
  attachments,
  mentions,
  message,
  updatedAt,
}) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const isMe = sender === user?.username;

  return (
    <div className={`flex flex-col mb-4 ${isMe ? "items-end" : "items-start"}`}>
      <span className="text-xs text-slate-400 font-medium mb-1 px-1">@{sender}</span>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 shadow-md backdrop-blur-sm ${
          isMe
            ? "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-tr-none"
            : "bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-none"
        }`}
      >
        {attachments && attachments[0]?.url && (
          <div className="relative mb-2 rounded-lg overflow-hidden border border-slate-800 bg-slate-950 max-w-[200px]">
            <img
              src={attachments[0].url}
              alt="attachment"
              className="object-cover w-full h-auto max-h-[160px] rounded-lg transition-transform hover:scale-105"
            />
          </div>
        )}
        <div className="flex flex-wrap items-center gap-1.5">
          {mentions && mentions.length > 0 && (
            <span className="text-sm font-semibold text-indigo-300 drop-shadow-sm">
              {mentions.map((mention) => `@${mention?.username}`).join(" ")}{" "}
            </span>
          )}
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message}</p>
        </div>
      </div>
      <span className="text-[10px] text-slate-500 mt-1 px-1">{moment(updatedAt).fromNow()}</span>
    </div>
  );
};

export default MessageBubble;
