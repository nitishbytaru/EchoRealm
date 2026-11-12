import React from "react";
import moment from "moment";
import { cn } from "@/lib/utils";

const CHIP_COLORS = ["bg-secondary", "bg-nb-accent", "bg-nb-success", "bg-nb-warning", "bg-destructive"];
export const chipColor = (name?: string) =>
  CHIP_COLORS[[...(name || "?")].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % CHIP_COLORS.length];

const GROUP_WINDOW_MINUTES = 5;

export interface MessageRun<T> {
  message: T;
  /** Day label to show above this message ("Today", "Yesterday", "Tue 11 Nov"), if a new day starts here. */
  dayLabel?: string;
  /** First message of a run from the same sender. */
  isFirst: boolean;
  /** Last message of a run from the same sender. */
  isLast: boolean;
}

const dayLabelFor = (m: moment.Moment) => {
  if (m.isSame(moment(), "day")) return "Today";
  if (m.isSame(moment().subtract(1, "day"), "day")) return "Yesterday";
  return m.format(m.isSame(moment(), "year") ? "ddd D MMM" : "D MMM YYYY");
};

/** Group consecutive messages from one sender (within 5 minutes) and mark where days change. */
export function groupMessages<T>(list: T[], senderOf: (m: T) => string | undefined, timeOf: (m: T) => string | undefined): MessageRun<T>[] {
  return list.map((message, i) => {
    const prev = list[i - 1];
    const next = list[i + 1];
    const t = moment(timeOf(message));
    const sameRun = (a?: T, b?: T) =>
      Boolean(a && b) &&
      senderOf(a as T) === senderOf(b as T) &&
      Math.abs(moment(timeOf(a as T)).diff(moment(timeOf(b as T)), "minutes")) < GROUP_WINDOW_MINUTES &&
      moment(timeOf(a as T)).isSame(moment(timeOf(b as T)), "day");
    const newDay = !prev || !moment(timeOf(prev)).isSame(t, "day");
    return {
      message,
      dayLabel: newDay && t.isValid() ? dayLabelFor(t) : undefined,
      isFirst: newDay || !sameRun(prev, message),
      isLast: !sameRun(message, next),
    };
  });
}

export function DaySeparator({ label }: { label: string }) {
  return (
    <div role="separator" aria-label={label} className="my-4 flex items-center gap-3">
      <span aria-hidden="true" className="h-[2px] flex-1 bg-[var(--nb-border-color)] opacity-20" />
      <span className="rounded-lg border-[2px] border-[var(--nb-border-color)] bg-card px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span aria-hidden="true" className="h-[2px] flex-1 bg-[var(--nb-border-color)] opacity-20" />
    </div>
  );
}

interface ChatMessageProps {
  text?: string;
  /** Text shown before the message, e.g. "@maya @theo". */
  prefix?: string;
  imageUrl?: string | null;
  time?: string;
  isMe: boolean;
  /** Name shown above the first message of a run (EchoShout, group chats). Omit in one-to-one chats. */
  senderName?: string;
  isFirst: boolean;
  isLast: boolean;
}

/** One chat message: avatar and name outside the bubble, the bubble holds only the content. */
export const ChatMessage = React.memo(function ChatMessage({
  text,
  prefix,
  imageUrl,
  time,
  isMe,
  senderName,
  isFirst,
  isLast,
}: ChatMessageProps) {
  const m = moment(time);
  const showSender = Boolean(senderName) && !isMe;

  return (
    <div className={cn("flex items-end gap-2", isMe ? "justify-end" : "justify-start", isLast ? "mb-4" : "mb-1")}>
      {showSender && (
        <span className="w-8 shrink-0" aria-hidden="true">
          {isLast && (
            <span
              className={cn(
                "flex size-8 items-center justify-center rounded-full border-[2px] border-[var(--nb-border-color)] text-xs font-extrabold text-on-color",
                chipColor(senderName)
              )}
            >
              {senderName?.slice(0, 1).toUpperCase()}
            </span>
          )}
        </span>
      )}

      <div className={cn("flex min-w-0 max-w-[80%] flex-col sm:max-w-[65%]", isMe ? "items-end" : "items-start")}>
        {showSender && isFirst && (
          <span className="mb-1 px-1 text-xs font-bold text-muted-foreground">@{senderName}</span>
        )}

        <div
          className={cn(
            "animate-scale-in border-[2px] border-[var(--nb-border-color)] px-3.5 py-2 shadow-[2px_2px_0_var(--nb-shadow-color)]",
            "rounded-2xl",
            isMe ? "bg-primary text-on-color" : "bg-card text-foreground",
            // Tail corner on the last bubble of a run; tighter corners between stacked bubbles.
            isMe
              ? cn(!isFirst && "rounded-tr-md", !isLast && "rounded-br-md", isLast && "rounded-br-sm")
              : cn(!isFirst && "rounded-tl-md", !isLast && "rounded-bl-md", isLast && "rounded-bl-sm")
          )}
        >
          {imageUrl && (
            <div className="-mx-1.5 mt-0.5 mb-1.5 overflow-hidden rounded-xl border-[2px] border-[var(--nb-border-color)]">
              <img
                src={imageUrl}
                alt={senderName ? `Image from ${senderName}` : "Shared image"}
                loading="lazy"
                decoding="async"
                className="max-h-64 w-full object-cover"
              />
            </div>
          )}
          <p className="text-[0.95rem] font-medium leading-snug break-words whitespace-pre-wrap">
            {prefix && <span className={cn("font-bold", !isMe && "text-nb-link")}>{prefix} </span>}
            {text}
            {isLast && m.isValid() && (
              <time
                dateTime={time}
                title={m.format("LLL")}
                className={cn(
                  "relative top-1 float-right ml-3 text-[0.68rem] font-semibold",
                  isMe ? "text-on-color/65" : "text-muted-foreground"
                )}
              >
                {m.format("HH:mm")}
              </time>
            )}
          </p>
        </div>
      </div>
    </div>
  );
});

export default ChatMessage;
