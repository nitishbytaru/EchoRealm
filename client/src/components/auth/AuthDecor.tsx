import Image from "next/image";
import { cn } from "@/lib/utils";
import { MARK_SRC, WORDMARK_SRC, Sparkle, ShoutLines, TypingBubble } from "@/components/brand/BrandMarks";

export { Sparkle, ShoutLines, TypingBubble };

/** Dot grid plus scattered marks from the logo, behind everything. */
export function AuthBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="auth-grid absolute inset-0" />
      <Sparkle className="absolute left-[6%] top-[12%] w-7 sm:w-9" style={{ animationDelay: "0.2s" }} />
      <Sparkle className="absolute right-[8%] bottom-[10%] w-6 sm:w-8" style={{ animationDelay: "1.1s" }} />
      <Sparkle className="absolute left-[44%] bottom-[6%] hidden w-5 lg:block" style={{ animationDelay: "1.8s" }} />
      <Sparkle className="absolute right-[38%] top-[8%] hidden w-5 lg:block" style={{ animationDelay: "0.7s" }} />
      <ShoutLines className="absolute left-[3%] bottom-[18%] hidden w-12 rotate-[200deg] sm:block" />
      <TypingBubble className="auth-drift absolute left-[50%] bottom-[24%] hidden scale-90 xl:inline-flex" tone="primary" />
    </div>
  );
}

/** The bubble mark, perched on the corner of the auth card. */
export function PerchedMark() {
  return (
    <div className="auth-mark-pop pointer-events-none absolute -top-[4.75rem] -right-3 z-20 w-32 sm:-top-24 sm:-right-6 sm:w-40 lg:-top-28 lg:-right-10 lg:w-48">
      <div className="auth-mark-bob">
        <Image src={MARK_SRC} alt="" width={682} height={502} priority className="h-auto w-full drop-shadow-none" />
      </div>
    </div>
  );
}

/** Wordmark as a tilted sticker; it is the page's h1. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <h1 className={cn("auth-sticker-in", className)} style={{ ["--tilt" as string]: "-3deg" }}>
      <Image src={WORDMARK_SRC} alt="EchoRealm" width={928} height={250} priority className="h-auto w-full" />
    </h1>
  );
}

const PREVIEW = [
  {
    area: "EchoLink",
    text: "movie tonight? 8 works",
    mine: true,
    tone: "bg-primary",
    tilt: "1.5deg",
  },
  {
    area: "EchoShout",
    text: "WHO'S AROUND RIGHT NOW?!",
    mine: false,
    tone: "bg-secondary",
    tilt: "-2deg",
  },
  {
    area: "EchoMumble",
    text: "someone thinks your playlist is great",
    mine: true,
    tone: "bg-nb-accent",
    tilt: "1deg",
  },
];

/** Left-hand stage on wide screens: headline plus a short chat preview. */
export function AuthStage() {
  return (
    <section aria-label="What EchoRealm is" className="relative hidden lg:block">
      <Wordmark className="w-full max-w-[26rem]" />

      <p className="auth-fade-in mt-8 text-5xl font-extrabold leading-[1.05] tracking-tight text-foreground xl:text-6xl" style={{ animationDelay: "0.15s" }}>
        Chat <mark className="auth-mark-word bg-primary">close.</mark>
        <br />
        Shout <mark className="auth-mark-word bg-secondary">loud.</mark>
        <br />
        Mumble <mark className="auth-mark-word bg-nb-accent">quietly.</mark>
      </p>

      <ul className="mt-10 flex max-w-md flex-col gap-4" aria-label="Examples of each space">
        {PREVIEW.map((item, i) => (
          <li
            key={item.area}
            className={cn("auth-sticker-in flex flex-col gap-1", item.mine ? "items-end" : "items-start")}
            style={{ ["--tilt" as string]: item.tilt, animationDelay: `${0.45 + i * 0.18}s` }}
          >
            <span className="px-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">{item.area}</span>
            <span
              className={cn(
                "max-w-[85%] rounded-2xl border-[3px] border-[var(--nb-border-color)] px-4 py-2.5 text-base font-bold text-on-color shadow-[var(--nb-shadow-sm)]",
                item.tone,
                item.mine ? "rounded-br-sm" : "rounded-bl-sm"
              )}
            >
              {item.text}
            </span>
          </li>
        ))}
        <li className="auth-sticker-in" style={{ ["--tilt" as string]: "-1deg", animationDelay: "1s" }}>
          <TypingBubble />
          <span className="sr-only">Someone is typing</span>
        </li>
      </ul>
    </section>
  );
}

/** Compact header for phones and tablets. */
export function AuthStageCompact() {
  return (
    <div className="mb-24 flex flex-col items-center gap-4 text-center sm:mb-28 lg:hidden">
      <Wordmark className="w-64 sm:w-80" />
      <ul className="auth-fade-in flex flex-wrap justify-center gap-2" style={{ animationDelay: "0.2s" }} aria-label="What EchoRealm is">
        <li className="-rotate-2 rounded-lg border-[2px] border-[var(--nb-border-color)] bg-primary px-2.5 py-1 text-sm font-bold text-on-color shadow-[3px_3px_0_var(--nb-shadow-color)]">Chat close</li>
        <li className="rotate-1 rounded-lg border-[2px] border-[var(--nb-border-color)] bg-secondary px-2.5 py-1 text-sm font-bold text-on-color shadow-[3px_3px_0_var(--nb-shadow-color)]">Shout loud</li>
        <li className="-rotate-1 rounded-lg border-[2px] border-[var(--nb-border-color)] bg-nb-accent px-2.5 py-1 text-sm font-bold text-on-color shadow-[3px_3px_0_var(--nb-shadow-color)]">Mumble quietly</li>
      </ul>
    </div>
  );
}
