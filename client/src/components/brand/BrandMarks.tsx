import { cn } from "@/lib/utils";

/** Logo assets, trimmed of their transparent padding by Cloudinary. */
export const MARK_SRC =
  "https://res.cloudinary.com/dhysbx7mk/image/upload/e_trim/v1784275596/echorealm/logos/echorealm_logo_without_text_fqp9sj.png";
export const WORDMARK_SRC =
  "https://res.cloudinary.com/dhysbx7mk/image/upload/e_trim/v1784275596/echorealm/logos/text_logo_echorealm_ixkbqk.png";

/** The four-point sparkle from the logo mark. */
export function Sparkle({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn("auth-sparkle", className)} style={style}>
      <path
        d="M12 1.5C12.9 8 16 11.1 22.5 12 16 12.9 12.9 16 12 22.5 11.1 16 8 12.9 1.5 12 8 11.1 11.1 8 12 1.5Z"
        fill="var(--primary)"
        stroke="var(--nb-border-color)"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** The three "shout" lines from the logo mark. */
export function ShoutLines({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 36" aria-hidden="true" className={cn("auth-shout", className)}>
      <g stroke="var(--nb-border-color)" strokeWidth="5" strokeLinecap="square">
        <path d="M4 6 L30 10" />
        <path d="M4 20 L28 18" />
        <path d="M8 33 L26 24" />
      </g>
    </svg>
  );
}

/** Small typing bubble, echoing the "…" bubbles on the mark. */
export function TypingBubble({ className, tone = "success" }: { className?: string; tone?: "success" | "primary" }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-xl rounded-bl-sm border-2 border-[var(--nb-border-color)] px-3 py-2.5 shadow-[var(--nb-shadow-sm)]",
        tone === "success" ? "bg-nb-success" : "bg-primary",
        className
      )}
    >
      <span className="auth-dot" />
      <span className="auth-dot" />
      <span className="auth-dot" />
    </span>
  );
}


/** Mumble's mark: a purple whisper bubble with quiet dots and soft whisper waves. */
export function MumbleMark({ className }: { className?: string }) {
  const bubble =
    "M24 8 H84 A18 18 0 0 1 102 26 V52 A18 18 0 0 1 84 70 H44 L24 86 L28 70 H24 A18 18 0 0 1 6 52 V26 A18 18 0 0 1 24 8 Z";
  return (
    <span aria-hidden="true" className={cn("nb-mumble-pop inline-block", className)}>
    <svg viewBox="0 0 136 96" className="nb-mumble-mark block w-full overflow-visible">
      <path d={bubble} transform="translate(6 6)" fill="var(--nb-shadow-color)" />
      <path d={bubble} fill="var(--nb-accent)" stroke="var(--nb-border-color)" strokeWidth="4" strokeLinejoin="round" />
      <g fill="var(--on-color)">
        <circle className="mm-dot" cx="36" cy="39" r="6" />
        <circle className="mm-dot" cx="54" cy="39" r="6" />
        <circle className="mm-dot" cx="72" cy="39" r="6" />
      </g>
      <g className="mm-waves" fill="none" stroke="var(--nb-border-color)" strokeWidth="4" strokeLinecap="round">
        <path className="mm-wave" d="M112 26 Q120 39 112 52" />
        <path className="mm-wave" d="M122 18 Q134 39 122 60" />
      </g>
    </svg>
    </span>
  );
}
