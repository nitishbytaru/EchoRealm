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
    <div className={`flex flex-col mb-4 ${isOwnMessage ? "items-end" : "items-start"}`}>
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-xs shadow-md leading-relaxed whitespace-pre-wrap break-words ${
          isOwnMessage
            ? "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-br-none"
            : "bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none"
        }`}
      >
        {attachmentUrl && (
          <div className="mb-2 max-w-full overflow-hidden rounded-lg">
            <img
              src={attachmentUrl}
              alt="Attachment"
              className="w-full h-auto max-h-60 object-cover hover:scale-105 transition-transform duration-350"
            />
          </div>
        )}

        <p>{messages?.message}</p>
      </div>

      <span className="text-[9px] text-slate-500 mt-1 px-1">
        {moment(messages?.createdAt).fromNow()}
      </span>
    </div>
  );
};

export default MessageBubble;
