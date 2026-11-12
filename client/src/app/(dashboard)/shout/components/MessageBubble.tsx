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


const CHIP_COLORS = ["bg-secondary", "bg-nb-accent", "bg-nb-success", "bg-nb-warning", "bg-destructive"];
const chipColor = (name: string) =>
  CHIP_COLORS[[...(name || "?")].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % CHIP_COLORS.length];

export const MessageBubble: React.FC<MessageBubbleProps> = React.memo(
  ({ sender, attachments, mentions, message, updatedAt, isMe }) => {
    return (
      <article className={`mb-3 flex ${isMe ? "justify-end" : "justify-start"}`}>
        <div
          className={`animate-scale-in w-fit max-w-[85%] rounded-2xl border-[3px] border-[var(--nb-border-color)] px-3.5 py-2 shadow-[var(--nb-shadow-sm)] sm:max-w-[70%] ${
            isMe ? "rotate-[0.6deg] rounded-br-md bg-primary text-on-color" : "-rotate-[0.4deg] rounded-bl-md bg-card text-foreground"
          }`}
        >
          <header className="mb-0.5 flex items-center gap-1.5 text-xs font-bold">
            {!isMe && (
              <span
                aria-hidden="true"
                className={`flex size-5 shrink-0 items-center justify-center rounded-md border-[2px] border-[var(--nb-border-color)] text-[0.6rem] font-extrabold text-on-color ${chipColor(sender)}`}
              >
                {sender?.slice(0, 1).toUpperCase()}
              </span>
            )}
            <span className="min-w-0 truncate">{isMe ? "You" : `@${sender}`}</span>
            <time
              dateTime={updatedAt}
              title={moment(updatedAt).format("LLL")}
              className={`ml-auto shrink-0 pl-3 text-[0.7rem] font-semibold ${isMe ? "text-on-color/70" : "text-muted-foreground"}`}
            >
              {moment(updatedAt).fromNow()}
            </time>
          </header>

          {attachments && attachments[0]?.url && (
            <div className="mb-2 overflow-hidden rounded-xl border-[3px] border-[var(--nb-border-color)]">
              <img src={attachments[0].url} alt={`Image shared by ${sender}`} className="max-h-60 w-full object-cover" loading="lazy" />
            </div>
          )}

          <p className="text-[0.95rem] font-semibold leading-snug break-words">
            {mentions?.length > 0 && (
              <span className={`underline decoration-2 underline-offset-2 ${isMe ? "" : "text-nb-link"}`}>
                {mentions.map((mention) => `@${mention?.username}`).join(" ")}{" "}
              </span>
            )}
            {message}
          </p>
        </div>
      </article>
    );
  }
);

MessageBubble.displayName = "MessageBubble";

export default MessageBubble;
