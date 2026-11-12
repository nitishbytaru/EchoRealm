"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { Inbox, Send } from "lucide-react";
import { RootState } from "@/store/store";
import { Sparkle, TypingBubble } from "@/components/brand/BrandMarks";
import { cn } from "@/lib/utils";

export default function MumblesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { unReadMumbles, Mumbles } = useSelector((state: RootState) => state.echoMumble);
  const pinned = (Mumbles || []).filter((m: any) => m?.pinned).length;
  const total = (Mumbles || []).length;

  const tabs = [
    { href: "/mumbles/read", label: "Inbox", icon: Inbox, count: unReadMumbles },
    { href: "/mumbles/send", label: "Send", icon: Send, count: 0 },
  ];
  // Inbox data is only loaded on the inbox; don't show zeros elsewhere.
  const showStats = total > 0 || pathname.startsWith("/mumbles/read");
  const activeIndex = Math.max(0, tabs.findIndex((t) => pathname.startsWith(t.href)));

  const stats = [
    { label: "new", value: unReadMumbles },
    { label: "in inbox", value: total },
    { label: "pinned", value: `${pinned}/4` },
  ];

  return (
    <div className="grid w-full flex-1 grid-cols-1 gap-6 lg:grid-cols-[19rem_minmax(0,1fr)] lg:gap-10">
      {/* Mumble HQ */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="relative rounded-2xl border-[3px] border-[var(--nb-border-color)] bg-card p-4 shadow-[var(--nb-shadow)] sm:p-5">
          {/* Bubble header, echoing the purple bubble in the logo */}
          <div className="relative -mt-1 mb-5 hidden lg:block" aria-hidden="true">
            <div className="relative w-fit rounded-[1.75rem] rounded-bl-md border-[3px] border-[var(--nb-border-color)] bg-nb-accent px-5 py-4 shadow-[var(--nb-shadow-sm)]">
              <TypingBubble />
            </div>
            <Sparkle className="absolute top-0 left-36 w-7" />
            <Sparkle className="absolute top-12 left-44 w-4" style={{ animationDelay: "1s" }} />
          </div>

          <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-foreground sm:text-3xl">
            Mumble <span className="nb-sticker-word bg-nb-accent">quietly.</span>
          </h1>
          <p className="mt-2 hidden text-sm font-medium text-muted-foreground sm:block">
            Short notes for one person. Send them as yourself, or as Someone.
          </p>

          {showStats && (
          <dl className="mt-4 grid grid-cols-3 gap-2 sm:mt-5">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl border-[3px] border-[var(--nb-border-color)] bg-muted px-2 py-1.5 text-center sm:py-2">
                <dt className="text-xs font-bold text-muted-foreground">{s.label}</dt>
                <dd className="text-lg font-extrabold text-foreground sm:text-xl">{s.value}</dd>
              </div>
            ))}
          </dl>
          )}

          <nav aria-label="Mumbles" className="relative mt-4 grid sm:mt-5 grid-cols-2 rounded-xl bg-muted p-1">
            <span
              aria-hidden="true"
              className="nb-pill absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-lg border-[3px] border-[var(--nb-border-color)] bg-nb-accent shadow-[var(--nb-shadow-active)]"
              style={{ transform: `translateX(${activeIndex * 100}%)` }}
            />
            {tabs.map((tab, i) => {
              const Icon = tab.icon;
              const isActive = i === activeIndex;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "relative z-10 flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-bold transition-colors",
                    isActive ? "text-on-color" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="rounded-md border-[2px] border-[var(--nb-border-color)] bg-primary px-1.5 text-xs font-extrabold text-on-color">
                      {tab.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      <div className="min-w-0">{children}</div>
    </div>
  );
}
