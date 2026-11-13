import React from "react";
import Handle from "@/components/Handle";
import moment from "moment";
import { HatGlasses, Heart } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { chipColor } from "@/components/chat/ChatMessage";

interface MumbleNoteProps {
  message: string;
  /** Username of the sender, or null when the Mumble is anonymous. */
  sender: string | null;
  /** Sender's profile picture, when we have one. */
  avatarUrl?: string | null;
  isUnread?: boolean;
  isPinned?: boolean;
  /** While a pin or unpin request is in flight. */
  pinState?: "pinning" | "unpinning";
  /** When the Mumble arrived (ISO string). */
  time?: string;
  likes?: number;
  /** Position in a list; gives each note its own tilt and pin color. */
  index?: number;
  /** Optional menu or action, shown at the top right. */
  action?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  placeholder?: string;
}

const TILTS = ["-rotate-[1.2deg]", "rotate-[0.8deg]", "-rotate-[0.5deg]", "rotate-[1.4deg]", "rotate-[0.3deg]", "-rotate-[1deg]"];
/** "now", "20m ago", "5h ago", "3d ago", then a date. */
const shortAgo = (m: moment.Moment) => {
  const mins = moment().diff(m, "minutes");
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return m.format("D MMM");
};

const PIN_COLORS = ["var(--primary)", "var(--nb-danger)", "var(--nb-secondary)"];

/** A neo-brutalist pushpin: outlined head with a highlight, hard shadow and a short needle. */
function PushPin({ color, className }: { color: string; className?: string }) {
  return (
    <svg viewBox="0 0 32 40" aria-hidden="true" className={cn("nb-pushpin", className)}>
      <path d="M16 22 L16 37" stroke="var(--nb-border-color)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="18.5" cy="14.5" r="11" fill="var(--nb-shadow-color)" />
      <circle cx="16" cy="12" r="11" fill={color} stroke="var(--nb-border-color)" strokeWidth="3" />
      <circle cx="12.5" cy="8.5" r="3" fill="#FFFFFF" opacity="0.75" />
    </svg>
  );
}

/** A Mumble as a small paper note: purple when new, ruled paper once read, dashed when anonymous. */
export default function MumbleNote({
  message,
  sender,
  avatarUrl,
  isUnread = false,
  isPinned = false,
  pinState,
  time,
  likes = 0,
  index = 0,
  action,
  footer,
  className,
  placeholder = "Your Mumble will appear here",
}: MumbleNoteProps) {
  const isAnonymous = !sender;
  const when = time ? moment(time) : null;

  return (
    <article
      className={cn(
        "nb-note group/note relative mt-3 rounded-2xl border-2 border-[var(--nb-border-color)] px-4 pt-8 pb-3 shadow-[var(--nb-shadow-sm)]",
        "transition-[rotate,translate,box-shadow] duration-200 hover:-translate-y-1 hover:rotate-0 hover:shadow-[var(--nb-shadow)]",
        TILTS[index % TILTS.length],
        isAnonymous && "border-dashed",
        isUnread ? "bg-nb-accent text-on-color" : "bg-card text-foreground",
        pinState && "nb-note-busy",
        className
      )}
    >
      {(isPinned || pinState) && (
        <span className="absolute -top-6 left-1/2 block w-8 -translate-x-1/2" title={isPinned ? "Pinned to your profile" : undefined}>
          <span
            className={cn(
              "block w-8 origin-bottom",
              pinState === "pinning" && "nb-pin-hover",
              pinState === "unpinning" && "nb-pin-pullout",
              !pinState && "nb-pin-drop"
            )}
          >
            <PushPin color={PIN_COLORS[index % PIN_COLORS.length]} className="block h-10 w-8" />
          </span>
          {!pinState && <span className="sr-only">Pinned</span>}
        </span>
      )}
      {pinState && (
        <>
          <span aria-hidden="true" className="nb-pin-target absolute inset-x-0 top-1.5 mx-auto h-1.5 w-6 rounded-full bg-[var(--nb-shadow-color)]" />
          <span
            role="status"
            className="absolute -top-4 right-1/2 mr-6 -rotate-3 whitespace-nowrap rounded-md border-[2px] border-[var(--nb-border-color)] bg-card px-2 py-0.5 text-[0.7rem] font-extrabold uppercase tracking-wide text-foreground shadow-[2px_2px_0_var(--nb-shadow-color)]"
          >
            {pinState === "pinning" ? "Pinning…" : "Unpinning…"}
          </span>
        </>
      )}

      {isUnread && (
        <span className="absolute -top-3 right-9 rotate-6 rounded-md border-[2px] border-[var(--nb-border-color)] bg-primary px-2 py-0.5 text-[0.7rem] font-extrabold uppercase tracking-wide text-on-color shadow-[2px_2px_0_var(--nb-shadow-color)]">
          New
        </span>
      )}

      <header className="flex items-center gap-3">
        {isAnonymous ? (
          <span
            aria-hidden="true"
            className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-[var(--nb-border-color)]",
              isUnread ? "bg-card text-foreground" : "bg-nb-accent text-on-color"
            )}
          >
            <HatGlasses className="size-6" strokeWidth={2.25} />
          </span>
        ) : (
          <Avatar className="size-12 border-2">
            {avatarUrl && <AvatarImage src={avatarUrl} alt="" className="object-cover" />}
            <AvatarFallback className={cn("text-base font-extrabold text-on-color", chipColor(sender ?? ""))}>
              {sender?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
        <span className="min-w-0 leading-tight">
          {isAnonymous ? (
            <span className="block text-base font-extrabold">Anonymous</span>
          ) : (
            <Handle name={sender as string} className="max-w-full text-base" />
          )}
          <span className={cn("mt-0.5 block truncate text-xs font-semibold", isUnread ? "text-on-color/75" : "text-muted-foreground")}>
            {when?.isValid() && (
              <time dateTime={time} title={when.format("LLL")}>
                {shortAgo(when)}
              </time>
            )}
          </span>
        </span>
        {action && <span className="ml-auto shrink-0 self-start">{action}</span>}
      </header>

      <p className={cn("mt-3 text-lg font-bold leading-7 break-words whitespace-pre-wrap", !isUnread && "nb-ruled", !message && "opacity-50")}>
        {message || placeholder}
      </p>

      {(likes > 0 || footer) && (
        <div className="mt-2 flex items-center gap-3">
          {likes > 0 && (
            <span className={cn("inline-flex items-center gap-1.5 text-sm font-bold", isUnread ? "text-on-color/80" : "text-muted-foreground")}>
              <Heart className="h-4 w-4 fill-nb-danger text-nb-danger-text" aria-hidden="true" />
              {likes} {likes === 1 ? "like" : "likes"}
            </span>
          )}
          {footer}
        </div>
      )}
    </article>
  );
}
