import React from "react";
import { Ban } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Handle from "@/components/Handle";
import { chipColor } from "@/lib/chipColor";
import { Sparkle } from "@/components/brand/BrandMarks";
import { cn } from "@/lib/utils";

const TILTS = ["-1.5deg", "1deg", "-0.5deg", "1.5deg", "0.5deg", "-1deg"];

interface PersonCardProps {
  name: string;
  avatarUrl?: string;
  /** Position in the list: sets the tilt and the entrance delay. */
  index?: number;
  /** "blocked" mutes the card: gray striped band, faded avatar, red no-entry sticker. */
  variant?: "default" | "blocked";
  /** Small sticker stamped on the band's corner, e.g. "Wants to be friends". */
  stamp?: React.ReactNode;
  /** Menu or button shown at the top right. */
  corner?: React.ReactNode;
  /** One line under the name, e.g. a relationship status. */
  subtitle?: React.ReactNode;
  /** While leaving the list (after an action). */
  leaving?: "out" | "celebrate" | "decline";
  /** Overlay shown while celebrating, e.g. "Friends now!". */
  celebration?: React.ReactNode;
  children?: React.ReactNode;
}

/** A person as a trading-card sticker: a band in their color, a big avatar over it, their handle, then actions. */
export default function PersonCard({
  name,
  avatarUrl,
  index = 0,
  variant = "default",
  stamp,
  corner,
  subtitle,
  leaving,
  celebration,
  children,
}: PersonCardProps) {
  const blocked = variant === "blocked";
  return (
    <li
      className={cn("nb-friend-in", leaving === "out" && "nb-card-out", leaving === "decline" && "nb-card-crumple")}
      style={{ ["--tilt" as string]: TILTS[index % TILTS.length], animationDelay: leaving ? undefined : `${0.25 + Math.min(index, 8) * 0.07}s` }}
    >
      <article className="nb-friend group/friend relative overflow-hidden rounded-2xl border-2 border-[var(--nb-border-color)] bg-card p-4 shadow-[var(--nb-shadow-sm)]">
        <div className="flex items-start gap-4">
          {/* Photo as a taped polaroid */}
          <div className={cn("nb-polaroid-person relative shrink-0 rounded-lg border-2 border-[var(--nb-border-color)] bg-card p-1.5 pb-2.5 shadow-[var(--nb-shadow-sm)]", blocked && "opacity-80")}>
            <span
              aria-hidden="true"
              className={cn(
                "nb-tape absolute -top-2.5 left-1/2 z-10 h-4 w-12 -translate-x-1/2 border-x-2 border-dashed border-[var(--nb-border-color)]/40 opacity-90",
                blocked ? "nb-hazard bg-muted" : chipColor(name)
              )}
            />
            <Avatar className={cn("size-[4.5rem] rounded-md border-2 shadow-none [&>*]:rounded-[0.3rem]", blocked && "grayscale")}>
              <AvatarImage src={avatarUrl} className="object-cover" />
              <AvatarFallback className={cn("rounded-[0.3rem] text-xl font-extrabold text-on-color", blocked ? "bg-muted text-muted-foreground" : chipColor(name))}>
                {name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {blocked && (
              <span aria-hidden="true" className="absolute -right-2.5 -bottom-2.5 flex size-8 rotate-12 items-center justify-center rounded-full border-2 border-[var(--nb-border-color)] bg-destructive text-on-color shadow-[2px_2px_0_var(--nb-shadow-color)]">
                <Ban className="size-4" strokeWidth={3} />
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1 pt-1">
            {stamp && <div className="mb-1.5">{stamp}</div>}
            <Handle name={name} className={cn("max-w-full text-lg", blocked && "text-muted-foreground line-through decoration-2")} />
            {subtitle && <div className="mt-0.5 text-sm font-semibold text-muted-foreground">{subtitle}</div>}
          </div>

          {corner && <div className="-mt-1 -mr-1 shrink-0">{corner}</div>}
        </div>

        {children && <div className="mt-4">{children}</div>}

        {leaving === "celebrate" && celebration && (
          <div className="nb-celebrate absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-nb-success text-on-color">
            {celebration}
            {/* Sparkle burst from the logo */}
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <span key={i} aria-hidden="true" className="nb-burst absolute top-1/2 left-1/2" style={{ ["--a" as string]: `${i * 45}deg`, animationDelay: `${(i % 2) * 60}ms` }}>
                <Sparkle className="w-5 [animation:none]" />
              </span>
            ))}
          </div>
        )}
        {leaving === "decline" && (
          <div aria-hidden="true" className="absolute inset-0 z-20 flex items-center justify-center bg-card/40">
            <span className="nb-stamp rounded-lg border-[3px] border-nb-danger-text px-3 py-1 text-2xl font-black uppercase tracking-wider text-nb-danger-text">
              Declined
            </span>
          </div>
        )}
      </article>
    </li>
  );
}

/** Shimmering placeholder cards shaped like PersonCard. */
export function PersonGhosts({ count = 3, label }: { count?: number; label: string }) {
  return (
    <div role="status" aria-label={label} className="grid grid-cols-1 gap-6 pt-2 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="nb-ghost-row rounded-2xl border-2 border-dashed border-[var(--nb-line)] p-4" style={{ animationDelay: `${i * 110}ms` }}>
          <div className="flex items-start gap-4">
            <span className="nb-ghost block size-[5.25rem] shrink-0 rounded-lg" />
            <div className="flex-1 space-y-2 pt-2">
              <span className="nb-ghost block h-3 w-16 rounded-md" />
              <span className="nb-ghost block h-5 w-28 rounded-md" />
            </div>
          </div>
          <span className="nb-ghost mt-4 block h-10 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}

/** Illustrated empty or prompt state that matches the cards. */
export function PeopleEmpty({
  icon,
  fill = "bg-secondary",
  title,
  text,
  action,
  decor,
}: {
  icon: React.ReactNode;
  fill?: string;
  title: string;
  text: string;
  action?: React.ReactNode;
  decor?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="nb-sticker-in relative w-full max-w-sm rounded-2xl border-2 border-dashed border-[var(--nb-border-color)] bg-muted/50 p-8 text-center" style={{ ["--tilt" as string]: "-1deg" }}>
        {decor}
        <span aria-hidden="true" className={cn("nb-empty-icon mx-auto flex size-14 items-center justify-center rounded-2xl border-2 border-[var(--nb-border-color)] text-on-color shadow-[var(--nb-shadow-sm)]", fill)}>
          {icon}
        </span>
        <p className="mt-4 text-xl font-extrabold text-foreground">{title}</p>
        <p className="mt-1 text-sm font-medium text-muted-foreground">{text}</p>
        {action && <div className="mt-5">{action}</div>}
      </div>
    </div>
  );
}
