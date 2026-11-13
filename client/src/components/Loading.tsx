import React from "react";
import { cn } from "@/lib/utils";

const BUBBLES = [
  { fill: "bg-primary", tail: "rounded-bl-md" },
  { fill: "bg-secondary", tail: "rounded-br-md" },
  { fill: "bg-nb-accent", tail: "rounded-bl-md" },
];

/** App loader: three speech-bubble stickers (EchoLink, EchoShout, EchoMumble) pop up in turn, typing as they go. */
const Loading: React.FC<{ label?: string; className?: string }> = ({ label = "Loading", className }) => {
  return (
    <div role="status" aria-live="polite" className={cn("flex h-full min-h-[200px] flex-col items-center justify-center gap-6", className)}>
      <div aria-hidden="true" className="nb-loader flex items-end gap-3">
        {BUBBLES.map((b, i) => (
          <span key={i} className={cn("nb-loader-bubble relative flex h-11 w-14 items-center justify-center gap-1 rounded-2xl border-2 border-[var(--nb-border-color)] shadow-[var(--nb-shadow-sm)]", b.fill, b.tail)}>
            {[0, 1, 2].map((j) => (
              <span key={j} className="nb-loader-dot" style={{ animationDelay: `${i * 0.6 + j * 0.08}s` }} />
            ))}
          </span>
        ))}
      </div>
      <span className="nb-loader-label text-sm font-extrabold uppercase tracking-[0.2em] text-muted-foreground">
        {label}
        <span aria-hidden="true" className="nb-loader-ellipsis" />
      </span>
    </div>
  );
};

export default Loading;
