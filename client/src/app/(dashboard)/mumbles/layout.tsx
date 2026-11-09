"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

export default function MumblesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { unReadMumbles } = useSelector((state: RootState) => state.echoMumble);

  const tabs = [
    { href: "/mumbles/read", label: unReadMumbles > 0 ? `Inbox (${unReadMumbles})` : "Inbox" },
    { href: "/mumbles/send", label: "Send" },
  ];

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6">
      <nav aria-label="Mumbles" className="flex gap-6 border-b-2 border-muted-foreground/40">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={isActive ? "page" : undefined}
              className={`-mb-0.5 flex min-h-11 items-center border-b-2 text-sm font-bold ${
                isActive
                  ? "border-nb-accent-text text-nb-accent-text"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
      {children}
    </div>
  );
}
