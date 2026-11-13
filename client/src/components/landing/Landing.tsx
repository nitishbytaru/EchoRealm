"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { setTheme, setIsChecked } from "@/store/slices/auth.slice";
import {
  ArrowRight,
  EyeOff,
  Heart,
  Megaphone,
  MessageCircle,
  MessageSquare,
  Moon,
  Pin,
  Send,
  ShieldCheck,
  Sparkles,
  Sun,
  Users,
  Zap,
} from "lucide-react";
import { RootState } from "@/store/store";
import { MARK_SRC, WORDMARK_SRC, MumbleMark, ShoutLines, Sparkle, TypingBubble } from "@/components/brand/BrandMarks";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ─────────────────────────── helpers ─────────────────────────── */

/** Adds `is-in` once the element scrolls into view, so CSS can play its entrance. */
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && (e.target.classList.add("is-in"), io.unobserve(e.target))),
      { threshold: 0.18 }
    );
    el.querySelectorAll(".lp-reveal").forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);
  return ref;
}

const SPACES = [
  {
    key: "link",
    name: "EchoLink",
    tag: "Chat close.",
    fill: "bg-primary",
    icon: MessageSquare,
    shot: "/landing/echolink.png",
    blurb: "Private one-to-one chats and group rooms with your friends. Messages land live, stack neatly, and show who said what at a glance.",
  },
  {
    key: "shout",
    name: "EchoShout",
    tag: "Shout loud.",
    fill: "bg-secondary",
    icon: Megaphone,
    shot: "/landing/echoshout.png",
    blurb: "One public room for everybody. Short, loud posts, @mentions with a heads-up, and an image when words aren't enough.",
  },
  {
    key: "mumble",
    name: "EchoMumble",
    tag: "Mumble quietly.",
    fill: "bg-nb-accent",
    icon: MessageCircle,
    shot: "/landing/echomumble.png",
    blurb: "Little paper notes for one person. Send them as yourself or anonymously, and pin your favourites to your profile.",
  },
] as const;

/* ─────────────────────────── page ─────────────────────────── */

export default function Landing() {
  const { isLoggedIn, theme } = useSelector((state: RootState) => state.auth);
  const rootRef = useReveal<HTMLDivElement>();
  const ctaHref = isLoggedIn ? "/links" : "/login?mode=register";
  const ctaText = isLoggedIn ? "Open EchoRealm" : "Join EchoRealm";

  return (
    <div ref={rootRef} className="relative min-h-dvh overflow-x-clip bg-background text-foreground">
      <div aria-hidden="true" className="nb-dotgrid pointer-events-none fixed inset-0 opacity-60" />
      <TopBar isLoggedIn={isLoggedIn} isDark={theme === "dark" || theme === "business"} />
      <main className="relative">
        <Hero ctaHref={ctaHref} ctaText={ctaText} />
        <Ticker />
        <SpacesTour />
        <ShoutDemo />
        <MumbleDemo />
        <Bento />
        <FinalCta ctaHref={ctaHref} ctaText={ctaText} />
      </main>
      <Footer />
    </div>
  );
}

/* ─────────────────────────── top bar ─────────────────────────── */

function TopBar({ isLoggedIn, isDark }: { isLoggedIn: boolean; isDark: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const dispatch = useDispatch();
  const toggleTheme = () => {
    const next = isDark ? "wireframe" : "business";
    dispatch(setTheme(next));
    dispatch(setIsChecked(!isDark));
    try {
      localStorage.setItem("theme", next);
    } catch {}
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-[background-color,border-color] duration-300",
        scrolled ? "border-b-2 border-[var(--nb-line)] bg-background/90 backdrop-blur" : "border-b-2 border-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" aria-label="EchoRealm home" className="flex items-center">
          <Image src={WORDMARK_SRC} alt="EchoRealm" width={928} height={250} priority className="h-8 w-auto -rotate-2 transition-transform duration-200 hover:rotate-0 sm:h-9" />
        </Link>
        <nav aria-label="Landing" className="hidden items-center gap-1 md:flex">
          {[
            ["#spaces", "Spaces"],
            ["#shout", "Try it"],
            ["#more", "Details"],
          ].map(([href, label]) => (
            <a key={href} href={href} className="rounded-xl px-3 py-2 text-sm font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              {label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
            className="flex size-10 items-center justify-center rounded-xl border-2 border-[var(--nb-border-color)] bg-card shadow-[var(--nb-shadow-sm)] tap-interactive"
          >
            {isDark ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
          </button>
          {isLoggedIn ? (
            <Link href="/links" className={buttonVariants({})}>
              Open app
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          ) : (
            <>
              <Link href="/login" className={cn(buttonVariants({ variant: "ghost" }), "hidden sm:inline-flex")}>
                Log in
              </Link>
              <Link href="/login?mode=register" className={buttonVariants({})}>
                Join free
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

/* ─────────────────────────── hero ─────────────────────────── */

function Hero({ ctaHref, ctaText }: { ctaHref: string; ctaText: string }) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  // Auto-cycle the three spaces in the app window.
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setActive((a) => (a + 1) % SPACES.length), 3800);
    return () => clearInterval(t);
  }, [paused]);

  // Pointer parallax: floating stickers drift with the cursor.
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = stageRef.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--px", String((e.clientX - r.left) / r.width - 0.5));
    el.style.setProperty("--py", String((e.clientY - r.top) / r.height - 0.5));
  };

  return (
    <section className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pt-10 pb-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:pt-16 lg:pb-24">
      {/* Copy */}
      <div className="relative z-10">
        <span className="lp-pop inline-flex -rotate-2 items-center gap-2 rounded-xl border-2 border-[var(--nb-border-color)] bg-card px-3 py-1.5 text-sm font-bold shadow-[var(--nb-shadow-sm)]">
          <span className="relative flex size-2.5">
            <span className="absolute inset-0 animate-ping rounded-full bg-nb-success opacity-75" />
            <span className="relative size-2.5 rounded-full bg-nb-success" />
          </span>
          Three ways to talk. One place.
        </span>
        <h1 className="mt-6 text-5xl leading-[1.05] font-extrabold tracking-tight sm:text-6xl">
          {SPACES.map((s, i) => (
            <span key={s.key} className="lp-word block" style={{ animationDelay: `${0.12 + i * 0.12}s` }}>
              {s.tag.split(" ")[0]}{" "}
              <button
                type="button"
                onClick={() => {
                  setActive(i);
                  setPaused(true);
                }}
                className={cn(
                  "nb-sticker-word cursor-pointer transition-transform duration-200 hover:-rotate-3",
                  s.fill,
                  active === i && "lp-word-active"
                )}
              >
                {s.tag.split(" ")[1]}
              </button>
            </span>
          ))}
        </h1>
        <p className="lp-fade mt-6 max-w-md text-lg font-medium text-muted-foreground" style={{ animationDelay: "0.55s" }}>
          EchoRealm is a playful little social space: private chats with friends, one loud public room, and quiet notes you can send
          anonymously.
        </p>
        <div className="lp-fade mt-8 flex flex-wrap items-center gap-3" style={{ animationDelay: "0.7s" }}>
          <Link href={ctaHref} className={cn(buttonVariants({ size: "lg" }), "lp-cta h-12 px-6 text-base")}>
            {ctaText}
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>
          <a href="#spaces" className={cn(buttonVariants({ size: "lg", variant: "outline" }), "h-12 px-6 text-base")}>
            Take the tour
          </a>
        </div>
      </div>

      {/* Stage: app window + floating stickers */}
      <div ref={stageRef} onPointerMove={onMove} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} className="lp-stage relative">
        <div className="lp-float pointer-events-none absolute -top-8 -left-6 z-20 w-24 sm:w-28" style={{ ["--depth" as string]: 30 }}>
          <Image src={MARK_SRC} alt="" width={682} height={502} className="h-auto w-full -rotate-12 drop-shadow-none" />
        </div>
        <div className="lp-float pointer-events-none absolute -right-4 -bottom-6 z-20" style={{ ["--depth" as string]: -24 }}>
          <TypingBubble className="rotate-6 scale-125" />
        </div>
        <div className="lp-float pointer-events-none absolute top-1/3 -right-6 z-20 hidden sm:block" style={{ ["--depth" as string]: 18 }}>
          <Sparkle className="w-9" />
        </div>
        <div className="lp-float pointer-events-none absolute bottom-10 -left-8 z-20 hidden sm:block" style={{ ["--depth" as string]: -14 }}>
          <ShoutLines className="w-12 rotate-[200deg]" />
        </div>

        <div className="lp-window relative rounded-2xl border-2 border-[var(--nb-border-color)] bg-card shadow-[var(--nb-shadow-lg)]">
          {/* Window chrome */}
          <div className="flex items-center gap-2 border-b-2 border-[var(--nb-line)] px-3 py-2.5">
            <span className="size-3 rounded-full border-2 border-[var(--nb-border-color)] bg-destructive" />
            <span className="size-3 rounded-full border-2 border-[var(--nb-border-color)] bg-nb-warning" />
            <span className="size-3 rounded-full border-2 border-[var(--nb-border-color)] bg-nb-success" />
            <div role="tablist" aria-label="App preview" className="ml-3 flex gap-1">
              {SPACES.map((s, i) => (
                <button
                  key={s.key}
                  type="button"
                  role="tab"
                  aria-selected={active === i}
                  onClick={() => {
                    setActive(i);
                    setPaused(true);
                  }}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-xs font-extrabold transition-colors",
                    active === i ? cn(s.fill, "text-on-color") : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
          {/* Screens */}
          <div className="relative aspect-[16/10] overflow-hidden rounded-b-[14px] bg-muted">
            {SPACES.map((s, i) => (
              <Image
                key={s.key}
                src={s.shot}
                alt={`${s.name} screen`}
                fill
                sizes="(min-width: 1024px) 640px, 100vw"
                priority={i === 0}
                className={cn("object-cover object-top transition-[opacity,scale] duration-700", active === i ? "scale-100 opacity-100" : "scale-[1.04] opacity-0")}
              />
            ))}
            {/* progress */}
            {!paused && <span key={active} className={cn("lp-progress absolute bottom-0 left-0 h-1.5", SPACES[active].fill)} />}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── ticker ─────────────────────────── */

function Ticker() {
  const items = ["Chat close", "Shout loud", "Mumble quietly", "Pin your favourites", "Go anonymous", "Make friends", "Group rooms", "Light & dark"];
  const fills = ["bg-primary", "bg-secondary", "bg-nb-accent", "bg-nb-success", "bg-nb-warning", "bg-destructive"];
  const row = (
    <div className="flex shrink-0 items-center gap-4 pr-4">
      {items.map((t, i) => (
        <span key={t} className={cn("inline-flex items-center gap-2 rounded-xl border-2 border-[var(--nb-border-color)] px-4 py-2 text-lg font-extrabold whitespace-nowrap text-on-color shadow-[var(--nb-shadow-sm)]", fills[i % fills.length], i % 2 ? "rotate-2" : "-rotate-2")}>
          <Sparkles className="size-4" aria-hidden="true" />
          {t}
        </span>
      ))}
    </div>
  );
  return (
    <div aria-hidden="true" className="relative -rotate-1 border-y-2 border-[var(--nb-border-color)] bg-card py-5">
      <div className="lp-marquee flex w-max">
        {row}
        {row}
      </div>
    </div>
  );
}

/* ─────────────────────────── spaces tour ─────────────────────────── */

function SpacesTour() {
  return (
    <section id="spaces" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-24 sm:px-6">
      <div className="lp-reveal max-w-2xl">
        <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Three <span className="nb-sticker-word bg-primary">spaces.</span>
        </h2>
        <p className="mt-4 text-lg font-medium text-muted-foreground">Each one is built for a different kind of conversation. Hover a screen to peek inside.</p>
      </div>
      <div className="mt-16 flex flex-col gap-24">
        {SPACES.map((s, i) => {
          const Icon = s.icon;
          return (
            <article key={s.key} className={cn("grid items-center gap-10 lg:grid-cols-2", i % 2 && "lg:[&>*:first-child]:order-2")}>
              <div className="lp-reveal lp-from-side" style={{ ["--side" as string]: i % 2 ? 1 : -1 }}>
                <span className={cn("inline-flex size-14 -rotate-6 items-center justify-center rounded-2xl border-2 border-[var(--nb-border-color)] text-on-color shadow-[var(--nb-shadow-sm)]", s.fill)}>
                  <Icon className="size-7" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl">{s.name}</h3>
                <p className="mt-1 text-xl font-extrabold text-muted-foreground">{s.tag}</p>
                <p className="mt-4 max-w-md text-lg font-medium text-muted-foreground">{s.blurb}</p>
              </div>
              <div className="lp-reveal lp-tilt-card group relative" style={{ ["--side" as string]: i % 2 ? -1 : 1 }}>
                <div className={cn("absolute inset-0 translate-x-4 translate-y-4 rounded-2xl border-2 border-[var(--nb-border-color)]", s.fill)} />
                <div className="relative overflow-hidden rounded-2xl border-2 border-[var(--nb-border-color)] bg-card transition-transform duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                  <Image src={s.shot} alt={`${s.name} in EchoRealm`} width={1440} height={900} className="h-auto w-full transition-transform duration-700 group-hover:scale-[1.06]" />
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

/* ─────────────────────────── shout demo ─────────────────────────── */

type DemoShout = { id: number; who: string; text: string; me?: boolean; fill: string };

function ShoutDemo() {
  const [shouts, setShouts] = useState<DemoShout[]>([
    { id: 1, who: "maya", text: "who's up for chai at 5?", fill: "bg-destructive" },
    { id: 2, who: "rohan", text: "the new library wifi is FAST", fill: "bg-nb-accent" },
    { id: 3, who: "theo", text: "big match tonight!!", fill: "bg-nb-success" },
  ]);
  const [text, setText] = useState("");
  const [shake, setShake] = useState(false);
  const logRef = useRef<HTMLDivElement | null>(null);
  const LIMIT = 55;

  const post = (e?: React.FormEvent) => {
    e?.preventDefault();
    const t = text.trim();
    if (!t || t.length > LIMIT) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }
    setShouts((prev) => [...prev.slice(-5), { id: Date.now(), who: "you", text: t, me: true, fill: "bg-primary" }]);
    setText("");
    // A friendly reply a moment later.
    const replies = ["LOUD and clear!", "same here 🙌", "haha yes", "count me in", "who said that? 👀"];
    const people = [
      ["lena", "bg-nb-accent"],
      ["sam", "bg-nb-success"],
      ["zara_k", "bg-secondary"],
    ];
    setTimeout(() => {
      const [who, fill] = people[Math.floor(Math.random() * people.length)];
      setShouts((prev) => [...prev.slice(-5), { id: Date.now() + 1, who, text: replies[Math.floor(Math.random() * replies.length)], fill }]);
    }, 1100);
  };

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [shouts]);

  return (
    <section id="shout" className="relative scroll-mt-20 border-y-2 border-[var(--nb-border-color)] bg-secondary/15 py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
        <div className="lp-reveal">
          <span className="inline-flex -rotate-3 items-center gap-1.5 rounded-lg border-2 border-[var(--nb-border-color)] bg-secondary px-2.5 py-1 text-sm font-extrabold text-on-color shadow-[2px_2px_0_var(--nb-shadow-color)]">
            <Zap className="size-4" aria-hidden="true" />
            Try it, right here
          </span>
          <h2 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Go on, <span className="nb-sticker-word bg-secondary">shout.</span>
          </h2>
          <p className="mt-4 max-w-md text-lg font-medium text-muted-foreground">
            Type something (55 characters, keep it loud) and hit enter. This little room is just a demo, but someone might still shout back.
          </p>
        </div>

        <div className="lp-reveal relative">
          <ShoutLines className="absolute -top-8 -left-8 w-14 rotate-[200deg]" />
          <div className={cn("overflow-hidden rounded-2xl border-2 border-[var(--nb-border-color)] bg-card shadow-[var(--nb-shadow-lg)]", shake && "lp-shake")}>
            <div ref={logRef} className="nb-dotgrid relative h-80 space-y-3 overflow-y-auto p-4 [mask-image:none]">
              {shouts.map((s) => (
                <div key={s.id} className={cn("lp-bubble flex items-end gap-2", s.me ? "justify-end" : "justify-start")}>
                  {!s.me && (
                    <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-[var(--nb-border-color)] text-xs font-extrabold text-on-color", s.fill)}>
                      {s.who[0].toUpperCase()}
                    </span>
                  )}
                  <div className={cn("max-w-[78%] rounded-2xl border-2 border-[var(--nb-border-color)] px-3.5 py-2 shadow-[2px_2px_0_var(--nb-shadow-color)]", s.me ? "rounded-br-sm bg-primary text-on-color" : "rounded-bl-sm bg-card")}>
                    {!s.me && <p className="text-xs font-bold text-muted-foreground">@{s.who}</p>}
                    <p className="text-[0.95rem] font-semibold">{s.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={post} className="flex items-center gap-2 border-t-2 border-[var(--nb-line)] bg-muted/60 p-3">
              <label htmlFor="lp-shout" className="sr-only">
                Your shout
              </label>
              <input
                id="lp-shout"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Shout something…"
                autoComplete="off"
                className="h-11 min-w-0 flex-1 rounded-xl border-2 border-[var(--nb-border-color)] bg-card px-3 text-base font-medium outline-none focus:shadow-[var(--nb-shadow-sm)]"
              />
              <span className={cn("w-12 text-right font-mono text-xs font-bold", text.length > LIMIT ? "text-nb-danger-text" : "text-muted-foreground")}>
                {text.length}/{LIMIT}
              </span>
              <button type="submit" aria-label="Post shout" className="flex size-11 items-center justify-center rounded-xl border-2 border-[var(--nb-border-color)] bg-primary text-on-color shadow-[var(--nb-shadow-sm)] tap-interactive">
                <Send className="size-5" aria-hidden="true" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── mumble demo ─────────────────────────── */

function MumbleDemo() {
  const [anon, setAnon] = useState(true);
  const [pinned, setPinned] = useState(false);
  const [liked, setLiked] = useState(false);
  const [msg, setMsg] = useState("your playlist got me through finals");

  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="lp-reveal relative order-2 flex justify-center lg:order-1">
          <div className="absolute -top-6 left-6">
            <MumbleMark className="w-28 -rotate-6" />
          </div>
          {/* The note */}
          <article
            className={cn(
              "lp-note relative mt-16 w-full max-w-sm rounded-2xl border-2 p-5 pt-9 shadow-[var(--nb-shadow)] transition-colors duration-300",
              anon ? "border-dashed border-[var(--nb-border-color)]" : "border-[var(--nb-border-color)]",
              "bg-nb-accent text-on-color"
            )}
          >
            {pinned && (
              <span key="pin" aria-hidden="true" className="lp-pin absolute -top-6 left-1/2 -translate-x-1/2">
                <svg viewBox="0 0 32 40" className="h-10 w-8 overflow-visible">
                  <path d="M16 22 L16 37" stroke="var(--nb-border-color)" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="18.5" cy="14.5" r="11" fill="var(--nb-shadow-color)" />
                  <circle cx="16" cy="12" r="11" fill="var(--primary)" stroke="var(--nb-border-color)" strokeWidth="3" />
                  <circle cx="12.5" cy="8.5" r="3" fill="#FFFFFF" opacity="0.75" />
                </svg>
              </span>
            )}
            <span className="absolute -top-3 right-6 rotate-6 rounded-md border-2 border-[var(--nb-border-color)] bg-primary px-2 py-0.5 text-[0.7rem] font-extrabold uppercase text-on-color shadow-[2px_2px_0_var(--nb-shadow-color)]">
              New
            </span>
            <header className="flex items-center gap-3">
              <span key={String(anon)} className={cn("lp-swap flex size-12 items-center justify-center rounded-full border-2 border-[var(--nb-border-color)]", anon ? "border-dashed bg-card text-foreground" : "bg-primary text-on-color")}>
                {anon ? <EyeOff className="size-6" aria-hidden="true" /> : <span className="text-base font-extrabold">YO</span>}
              </span>
              <span>
                <span className="block text-base font-extrabold">{anon ? "Anonymous" : "@you"}</span>
                <span className="block text-xs font-semibold opacity-75">just now</span>
              </span>
              <button
                type="button"
                onClick={() => setLiked((v) => !v)}
                aria-pressed={liked}
                aria-label={liked ? "Unlike" : "Like"}
                className={cn("ml-auto flex size-10 items-center justify-center rounded-full border-2 transition-colors", liked ? "border-[var(--nb-border-color)] bg-destructive" : "border-transparent hover:border-[var(--nb-border-color)]")}
              >
                <Heart key={String(liked)} className={cn("nb-pop size-5", liked && "fill-current")} aria-hidden="true" />
              </button>
            </header>
            <p className="mt-4 min-h-14 text-xl leading-snug font-bold break-words">{msg || "…"}</p>
          </article>
        </div>

        <div className="lp-reveal order-1 lg:order-2">
          <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Write a <span className="nb-sticker-word bg-nb-accent">Mumble.</span>
          </h2>
          <p className="mt-4 max-w-md text-lg font-medium text-muted-foreground">Play with this one. It&apos;s exactly how a Mumble looks in someone&apos;s inbox.</p>
          <label htmlFor="lp-mumble" className="sr-only">
            Mumble text
          </label>
          <input
            id="lp-mumble"
            value={msg}
            maxLength={55}
            onChange={(e) => setMsg(e.target.value)}
            className="mt-6 h-12 w-full max-w-md rounded-xl border-2 border-[var(--nb-border-color)] bg-card px-4 text-base font-bold outline-none focus:shadow-[var(--nb-shadow-sm)]"
          />
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" aria-pressed={anon} onClick={() => setAnon((v) => !v)} className={cn(buttonVariants({ variant: anon ? "default" : "outline" }), anon && "bg-nb-accent text-on-color")}>
              <EyeOff className="h-4 w-4" aria-hidden="true" />
              {anon ? "Anonymous: on" : "Anonymous: off"}
            </button>
            <button type="button" aria-pressed={pinned} onClick={() => setPinned((v) => !v)} className={buttonVariants({ variant: pinned ? "default" : "outline" })}>
              <Pin className="h-4 w-4" aria-hidden="true" />
              {pinned ? "Pinned" : "Pin it"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── bento ─────────────────────────── */

function Bento() {
  const tiles = [
    { title: "Friends & requests", text: "Find people by username, send a request, accept with a little celebration.", icon: Users, fill: "bg-secondary", img: "/landing/friends.png", span: "md:col-span-2" },
    { title: "Go anonymous", text: "Shout and Mumble with a disguise on, whenever you like.", icon: EyeOff, fill: "bg-nb-accent", span: "" },
    { title: "Pin your favourites", text: "Keep up to four Mumbles on your public profile.", icon: Pin, fill: "bg-primary", span: "" },
    { title: "Light & dark", text: "A warm paper look by day, true black at night.", icon: Moon, fill: "bg-foreground", img: "/landing/echoshout-dark.png", span: "md:col-span-2" },
    { title: "You're in control", text: "Block anyone, close your Mumble inbox, or delete your data whenever you want.", icon: ShieldCheck, fill: "bg-nb-success", span: "md:col-span-2" },
    { title: "Likes & love", text: "Heart the notes you love; the most loved one gets a spotlight.", icon: Heart, fill: "bg-destructive", span: "" },
  ];
  return (
    <section id="more" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-24 sm:px-6">
      <h2 className="lp-reveal text-4xl font-extrabold tracking-tight sm:text-5xl">
        And the <span className="nb-sticker-word bg-nb-warning">little things.</span>
      </h2>
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {tiles.map((t, i) => {
          const Icon = t.icon;
          return (
            <div
              key={t.title}
              className={cn("lp-reveal lp-tile group relative overflow-hidden rounded-2xl border-2 border-[var(--nb-border-color)] bg-card p-6 shadow-[var(--nb-shadow-sm)]", t.span)}
              style={{ transitionDelay: `${(i % 3) * 80}ms` }}
            >
              <span className={cn("inline-flex size-12 items-center justify-center rounded-xl border-2 border-[var(--nb-border-color)] text-background transition-transform duration-300 group-hover:-rotate-12", t.fill, t.fill !== "bg-foreground" && "text-on-color")}>
                <Icon className="size-6" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-xl font-extrabold">{t.title}</h3>
              <p className="mt-1 max-w-sm font-medium text-muted-foreground">{t.text}</p>
              {!t.img && (
                <span aria-hidden="true" className={cn("absolute -right-6 -bottom-8 flex size-36 rotate-12 items-center justify-center rounded-[2rem] border-2 border-[var(--nb-border-color)] opacity-25 transition-transform duration-500 group-hover:rotate-0 group-hover:scale-110", t.fill)}>
                  <Icon className="size-20 text-on-color" />
                </span>
              )}
              {t.img && (
                <div className="pointer-events-none mt-5 -mb-10 overflow-hidden rounded-xl border-2 border-[var(--nb-border-color)] transition-transform duration-500 group-hover:-translate-y-3">
                  <Image src={t.img} alt="" width={1440} height={900} className="h-auto w-full" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ─────────────────────────── final CTA ─────────────────────────── */

function FinalCta({ ctaHref, ctaText }: { ctaHref: string; ctaText: string }) {
  return (
    <section className="px-4 pb-24 sm:px-6">
      <div className="lp-reveal relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] border-2 border-[var(--nb-border-color)] bg-primary px-6 py-16 text-center text-on-color shadow-[var(--nb-shadow-lg)] sm:py-20">
        <div aria-hidden="true" className="nb-dotgrid absolute inset-0 opacity-50 [mask-image:none]" />
        <Sparkle className="absolute top-8 left-10 w-10" />
        <Sparkle className="absolute right-14 bottom-10 w-7" style={{ animationDelay: "1s" }} />
        <TypingBubble className="absolute top-10 right-10 hidden rotate-6 sm:inline-flex" tone="success" />
        <div className="relative">
          <h2 className="text-4xl font-extrabold tracking-tight sm:text-6xl">Your realm is waiting.</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg font-semibold opacity-80">Free to join. Bring your friends, or make new ones.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href={ctaHref} className="lp-cta inline-flex h-14 items-center gap-2 rounded-2xl border-2 border-[var(--on-color)] bg-card px-8 text-lg font-extrabold text-foreground shadow-[6px_6px_0_var(--on-color)] tap-interactive">
              {ctaText}
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
            <Link href="/login" className="inline-flex h-14 items-center rounded-2xl border-2 border-[var(--on-color)] px-8 text-lg font-extrabold text-on-color transition-colors hover:bg-card/30">
              I have an account
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── footer ─────────────────────────── */

function Footer() {
  return (
    <footer className="relative border-t-2 border-[var(--nb-line)]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 sm:px-6">
        <Image src={WORDMARK_SRC} alt="EchoRealm" width={928} height={250} className="h-7 w-auto -rotate-2" />
        <p className="text-sm font-semibold text-muted-foreground">Chat close. Shout loud. Mumble quietly.</p>
      </div>
    </footer>
  );
}
