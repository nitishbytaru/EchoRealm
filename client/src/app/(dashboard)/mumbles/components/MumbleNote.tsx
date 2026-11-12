import React from "react";
import { EyeOff, Pin } from "lucide-react";
import { cn } from "@/lib/utils";

interface MumbleNoteProps {
  message: string;
  /** Username of the sender, or null when the Mumble is anonymous. */
  sender: string | null;
  isUnread?: boolean;
  isPinned?: boolean;
  /** Position in a list; used to give each note a slightly different tilt. */
  index?: number;
  /** Optional menu or action, shown at the top right. */
  action?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  placeholder?: string;
}

const TILTS = ["-rotate-[1.2deg]", "rotate-[0.8deg]", "-rotate-[0.5deg]", "rotate-[1.4deg]", "rotate-[0.3deg]", "-rotate-[1deg]"];

/** A Mumble as a small paper note: purple when new, dashed when anonymous. */
export default function MumbleNote({
  message,
  sender,
  isUnread = false,
  isPinned = false,
  index = 0,
  action,
  footer,
  className,
  placeholder = "Your Mumble will appear here",
}: MumbleNoteProps) {
  const isAnonymous = !sender;
  return (
    <article
      className={cn(
        "relative rounded-2xl border-[3px] border-[var(--nb-border-color)] p-4 pt-3 shadow-[var(--nb-shadow-sm)] transition-[rotate,translate,box-shadow] duration-200 hover:-translate-y-0.5 hover:rotate-0 hover:shadow-[var(--nb-shadow)]",
        TILTS[index % TILTS.length],
        isAnonymous && "border-dashed",
        isUnread ? "bg-nb-accent text-on-color" : "bg-card text-foreground",
        className
      )}
    >
      {!isUnread && <span aria-hidden="true" className="absolute inset-x-4 top-0 h-1.5 rounded-b-md bg-nb-accent" />}
      {isPinned && (
        <span
          className="absolute -top-3 -left-3 flex size-8 rotate-[-12deg] items-center justify-center rounded-lg border-[3px] border-[var(--nb-border-color)] bg-primary text-on-color shadow-[2px_2px_0_var(--nb-shadow-color)]"
          title="Pinned to your profile"
        >
          <Pin className="size-4" aria-hidden="true" />
          <span className="sr-only">Pinned</span>
        </span>
      )}

      <header className="flex min-h-9 items-center gap-2">
        <span className={cn("flex min-w-0 items-center gap-1.5 text-sm font-bold", isUnread ? "text-on-color" : "text-muted-foreground")}>
          {isAnonymous && <EyeOff className="size-4 shrink-0" aria-hidden="true" />}
          <span className="truncate">{isAnonymous ? "Someone" : `@${sender}`}</span>
        </span>
        {isUnread && (
          <span className="shrink-0 rotate-2 rounded-md border-[2px] border-[var(--nb-border-color)] bg-primary px-1.5 text-xs font-extrabold uppercase text-on-color">
            New
          </span>
        )}
        {action && <span className="ml-auto shrink-0">{action}</span>}
      </header>

      <p className={cn("mt-1 text-lg font-bold leading-snug break-words whitespace-pre-wrap", !message && "opacity-50")}>
        {message || placeholder}
      </p>
      {footer && <div className="mt-3">{footer}</div>}
    </article>
  );
}
