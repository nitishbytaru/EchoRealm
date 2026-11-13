import { TypingBubble } from "@/components/brand/BrandMarks";
import { cn } from "@/lib/utils";

// Ghost messages laid out like the real feed: others on the left with an avatar, yours on the right.
const GHOSTS = [
  { me: false, bubble: "w-52 sm:w-64", name: "w-14", avatar: true },
  { me: false, bubble: "w-36 sm:w-44", continued: true },
  { me: true, bubble: "w-40 sm:w-48" },
  { me: false, bubble: "w-60 sm:w-80", name: "w-20", avatar: true },
  { me: true, bubble: "w-28 sm:w-36" },
  { me: false, bubble: "w-44 sm:w-52", name: "w-12", avatar: true },
];

/** EchoShout's first load: ghost messages that type in, plus a typing bubble from the logo. */
export default function ShoutLoading() {
  return (
    <div role="status" aria-live="polite" className="relative flex flex-1 flex-col overflow-hidden">
      <span className="sr-only">Loading EchoShout</span>
      <div aria-hidden="true" className="nb-dotgrid pointer-events-none absolute inset-0 opacity-50" />

      <div aria-hidden="true" className="relative flex flex-1 flex-col justify-end px-4 pt-4">
        {GHOSTS.map((g, i) => (
          <div
            key={i}
            className={cn("nb-ghost-row flex items-end gap-2", g.me ? "justify-end" : "justify-start", g.continued ? "mb-4" : "mb-1.5")}
            style={{ animationDelay: `${i * 110}ms` }}
          >
            {!g.me && (
              <span className="w-8 shrink-0">
                {(g.continued || !GHOSTS[i + 1]?.continued) && <span className="nb-ghost block size-8 rounded-full" />}
              </span>
            )}
            <div className={cn("flex flex-col gap-1.5", g.me ? "items-end" : "items-start")}>
              {g.name && <span className={cn("nb-ghost block h-3 rounded-md", g.name)} />}
              <span className={cn("nb-ghost block h-10 rounded-2xl", g.me && "nb-ghost--me", g.bubble)} />
            </div>
          </div>
        ))}

        <div className="nb-ghost-row mt-2 mb-4 flex items-center gap-3" style={{ animationDelay: `${GHOSTS.length * 110}ms` }}>
          <TypingBubble tone="primary" />
          <span className="text-sm font-bold text-muted-foreground">Tuning in to the room…</span>
        </div>
      </div>
    </div>
  );
}
