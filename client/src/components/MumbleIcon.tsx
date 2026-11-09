"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import CountBadge from "@/components/CountBadge";
import { cn } from "@/lib/utils";
import { MessageCircle, Mail, Send } from "lucide-react";
import { RootState } from "@/store/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface MumbleIconProps {
  isBottomNav?: boolean;
}

export const MumbleIcon: React.FC<MumbleIconProps> = ({ isBottomNav = false }) => {
  const { isLoggedIn } = useSelector((state: RootState) => state.auth);
  const { unReadMumbles } = useSelector((state: RootState) => state.echoMumble);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isActive = pathname.startsWith("/mumbles");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className={
          isBottomNav
            ? cn("relative flex h-full flex-1 flex-col items-center justify-center gap-1 tap-interactive", isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground")
            : cn(
                "relative flex items-center gap-2 rounded-xl border-[3px] px-4 py-2 text-sm font-bold transition-all duration-150 tap-interactive",
                isActive
                  ? "border-[var(--nb-border-color)] bg-nb-accent text-on-color shadow-[var(--nb-shadow-sm)]"
                  : "border-transparent text-muted-foreground hover:border-[var(--nb-border-color)] hover:bg-muted hover:text-foreground"
              )
        }
      >
        <span className={cn("relative flex items-center justify-center", isBottomNav && "h-10 w-10 rounded-xl", isBottomNav && isActive && "border-[2px] border-[var(--nb-border-color)] bg-nb-accent text-on-color shadow-[2px_2px_0px_var(--nb-shadow-color)]")}>
          <MessageCircle className="h-5 w-5" />
          {isBottomNav && <CountBadge count={unReadMumbles} label="unread Mumbles" className="-top-1 -right-2 bg-nb-accent" />}
        </span>
        <span className={isBottomNav ? "text-xs font-bold" : ""}>EchoMumble</span>
        {!isBottomNav && <CountBadge count={unReadMumbles} label="unread Mumbles" className="-top-2 -right-2 bg-nb-accent" />}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-base font-extrabold text-foreground tracking-tight">
            EchoMumble
          </DialogTitle>
        </DialogHeader>

        {/* Subtitle */}
        <p className="text-center text-xs text-muted-foreground font-medium -mt-2 pb-1">
          Choose an action
        </p>

        <div className="flex flex-col sm:flex-row gap-3 py-2">
          {isLoggedIn && (
            <Link href="/mumbles/read" onClick={() => setOpen(false)} className="flex-1 w-full h-24 flex flex-col items-center justify-center gap-2 rounded-xl transition-all duration-150 tap-interactive bg-card border-[3px] border-[var(--nb-border-color)] shadow-[var(--nb-shadow-sm)] hover:shadow-[var(--nb-shadow)] text-foreground"
            >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-secondary/20 border-[2px] border-[var(--nb-border-color)]">
                  <Mail className="h-5 w-5 text-nb-link" />
                </div>
                <span className="text-xs font-bold text-foreground">Inbox</span>
                <span className="text-xs text-muted-foreground font-medium -mt-1">Read your mumbles</span>
            </Link>
          )}

          <Link href="/mumbles/send" onClick={() => setOpen(false)} className="flex-1 w-full h-24 flex flex-col items-center justify-center gap-2 rounded-xl transition-all duration-150 tap-interactive bg-card border-[3px] border-[var(--nb-border-color)] shadow-[var(--nb-shadow-sm)] hover:shadow-[var(--nb-shadow)] text-foreground"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-nb-accent/20 border-[2px] border-[var(--nb-border-color)]">
                <Send className="h-5 w-5 text-nb-accent-text" />
              </div>
              <span className="text-xs font-bold text-foreground">Send</span>
              <span className="text-xs text-muted-foreground font-medium -mt-1">Whisper to someone</span>
          </Link>
        </div>

        <div className="flex justify-end pt-1">
          <DialogClose
            render={
              <Button variant="outline" size="sm">
                Close
              </Button>
            }
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MumbleIcon;
