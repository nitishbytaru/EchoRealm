"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { Inbox, Send, Bell, Pin, EyeOff, type LucideIcon } from "lucide-react";
import { RootState } from "@/store/store";
import { MumbleMark, Sparkle } from "@/components/brand/BrandMarks";
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
  // Only show counts once there are Mumbles to count, so loading or other pages never show a row of zeros.
  const showStats = total > 0;
  const activeIndex = Math.max(0, tabs.findIndex((t) => pathname.startsWith(t.href)));

  const stats: { label: string; value: React.ReactNode; icon: LucideIcon; fill: string; tilt: string }[] = [
    { label: "New", value: unReadMumbles, icon: Bell, fill: "bg-primary", tilt: "-rotate-2" },
    { label: "In inbox", value: total, icon: Inbox, fill: "bg-nb-accent", tilt: "rotate-1" },
    { label: "Pinned", value: `${pinned}/4`, icon: Pin, fill: "bg-nb-success", tilt: "-rotate-1" },
  ];

  return (
    <div className="grid w-full flex-1 grid-cols-1 gap-6 lg:grid-cols-[19rem_minmax(0,1fr)] lg:gap-10">
      {/* Mumble HQ */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="nb-sticker-in group/hq relative overflow-hidden rounded-2xl border-[3px] border-[var(--nb-border-color)] bg-card shadow-[var(--nb-shadow)]">
          {/* Header band with the Mumble mark */}
          <div className="relative flex h-20 items-center border-b-[3px] border-[var(--nb-border-color)] bg-nb-accent/25 px-5 sm:h-28 lg:h-32">
            <div aria-hidden="true" className="nb-dotgrid absolute inset-0 opacity-70 [mask-image:none]" />
            <MumbleMark className="relative w-20 -rotate-3 sm:w-28 lg:w-32" />
            <Sparkle className="absolute top-4 right-8 w-7" />
            <Sparkle className="absolute right-16 bottom-5 w-4" style={{ animationDelay: "1.1s" }} />
          </div>

          <div className="p-4 sm:p-5">
            <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-foreground sm:text-3xl">
              Mumble <span className="nb-sticker-word bg-nb-accent">quietly.</span>
            </h1>
            <p className="mt-2 hidden text-sm font-medium text-muted-foreground sm:block">
              Short notes for one person. Send them as yourself, or anonymously.
            </p>

            {showStats && (
              <dl className="mt-5 grid grid-cols-3 gap-2.5">
                {stats.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <div
                      key={s.label}
                      className={cn(
                        "nb-stat-in group/stat rounded-xl border-[3px] border-[var(--nb-border-color)] bg-card px-2 pt-2 pb-2.5 text-center shadow-[2px_2px_0_var(--nb-shadow-color)] transition-[rotate,translate,box-shadow] duration-200 hover:-translate-y-1 hover:rotate-0 hover:shadow-[var(--nb-shadow-sm)]",
                        s.tilt
                      )}
                      style={{ animationDelay: `${0.25 + i * 0.09}s` }}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "mx-auto flex size-7 items-center justify-center rounded-lg border-[2px] border-[var(--nb-border-color)] text-on-color transition-transform duration-200 group-hover/stat:-rotate-12",
                          s.fill
                        )}
                      >
                        <Icon className="size-3.5" />
                      </span>
                      <dd className="mt-1.5 text-xl font-extrabold leading-none text-foreground">{s.value}</dd>
                      <dt className="mt-1 text-[0.7rem] font-bold uppercase tracking-wide text-muted-foreground">{s.label}</dt>
                    </div>
                  );
                })}
              </dl>
            )}

            <nav aria-label="Mumbles" className="relative mt-5 grid grid-cols-2 rounded-xl bg-muted p-1">
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

            <p className="mt-4 hidden items-start gap-2 text-xs font-semibold text-muted-foreground sm:flex">
              <EyeOff className="mt-px size-3.5 shrink-0" aria-hidden="true" />
              Anonymous Mumbles show as &ldquo;Anonymous&rdquo;, with a dashed outline.
            </p>
          </div>
        </div>
      </aside>

      <div className="min-w-0">{children}</div>
    </div>
  );
}
