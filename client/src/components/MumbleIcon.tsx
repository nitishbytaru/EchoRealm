"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { MessageCircle } from "lucide-react";
import CountBadge from "@/components/CountBadge";
import { RootState } from "@/store/store";
import { cn } from "@/lib/utils";

interface MumbleIconProps {
  isBottomNav?: boolean;
}

export const MumbleIcon: React.FC<MumbleIconProps> = ({ isBottomNav = false }) => {
  const { unReadMumbles } = useSelector((state: RootState) => state.echoMumble);
  const pathname = usePathname();
  const isActive = pathname.startsWith("/mumbles");

  if (isBottomNav) {
    return (
      <Link
        href="/mumbles/read"
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "relative flex h-full flex-1 flex-col items-center justify-center gap-1 tap-interactive",
          isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <span
          className={cn(
            "relative flex h-10 w-10 items-center justify-center rounded-xl",
            isActive && "border-[2px] border-[var(--nb-border-color)] bg-nb-accent text-on-color shadow-[2px_2px_0px_var(--nb-shadow-color)]"
          )}
        >
          <MessageCircle className="h-5 w-5" />
          <CountBadge count={unReadMumbles} label="unread Mumbles" className="-top-1 -right-2 bg-nb-accent" />
        </span>
        <span className="text-xs font-bold">EchoMumble</span>
      </Link>
    );
  }

  return (
    <div className="relative">
      <Link
        href="/mumbles/read"
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "flex items-center gap-2 rounded-xl border-[3px] px-4 py-2 text-sm font-bold transition-all duration-150 tap-interactive",
          isActive
            ? "border-[var(--nb-border-color)] bg-nb-accent text-on-color shadow-[var(--nb-shadow-sm)]"
            : "border-transparent text-muted-foreground hover:border-[var(--nb-border-color)] hover:bg-muted hover:text-foreground"
        )}
      >
        <MessageCircle className="h-5 w-5" />
        <span>EchoMumble</span>
      </Link>
      <CountBadge count={unReadMumbles} label="unread Mumbles" className="-top-2 -right-2 bg-nb-accent" />
    </div>
  );
};

export default MumbleIcon;
