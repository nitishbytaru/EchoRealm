"use client";

import React from "react";
import moment from "moment";

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

// A shout is a poster, not a bubble: the shorter it is, the louder it gets.
const volumeClass = (length: number) => {
  if (length <= 18) return "text-4xl sm:text-5xl";
  if (length <= 36) return "text-3xl sm:text-4xl";
  return "text-2xl sm:text-3xl";
};

export const MessageBubble: React.FC<MessageBubbleProps> = React.memo(
  ({ sender, attachments, mentions, message, updatedAt, isMe }) => {
    return (
      <article
        className={`mb-5 animate-scale-in rounded-2xl border-[3px] border-[var(--nb-border-color)] p-4 shadow-[var(--nb-shadow)] sm:p-5 ${
          isMe ? "bg-primary text-primary-foreground" : "bg-card text-foreground"
        }`}
      >
        <header className="mb-2 flex items-baseline justify-between gap-3 text-sm font-bold">
          <span className="min-w-0 truncate">@{sender}</span>
          <time dateTime={updatedAt} title={moment(updatedAt).format("LLL")} className="shrink-0 text-xs">
            {moment(updatedAt).fromNow()}
          </time>
        </header>

        {attachments && attachments[0]?.url && (
          <div className="mb-3 overflow-hidden rounded-xl border-[3px] border-[var(--nb-border-color)]">
            <img src={attachments[0].url} alt={`Image shared by ${sender}`} className="max-h-80 w-full object-cover" loading="lazy" />
          </div>
        )}

        <p className={`font-extrabold leading-[1.05] tracking-tight break-words ${volumeClass(message?.length ?? 0)}`}>
          {mentions?.length > 0 && (
            <span className="underline decoration-[3px] underline-offset-4">
              {mentions.map((mention) => `@${mention?.username}`).join(" ")}{" "}
            </span>
          )}
          {message}
        </p>
      </article>
    );
  }
);

MessageBubble.displayName = "MessageBubble";

export default MessageBubble;
