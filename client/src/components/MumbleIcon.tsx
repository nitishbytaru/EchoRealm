"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
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
  const { isLoggedIn, isMobile } = useSelector((state: RootState) => state.auth);
  const { unReadMumbles } = useSelector((state: RootState) => state.echoMumble);
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={isBottomNav 
        ? "flex flex-col items-center justify-center gap-1 w-full h-full text-muted-foreground hover:text-foreground relative tap-interactive"
        : "flex items-center gap-2 cursor-pointer w-full text-left tap-interactive"
      }>
        <div className="relative">
          <MessageCircle className="h-5 w-5" />
          {unReadMumbles > 0 && (
            <span className="absolute -top-2 -right-2 bg-nb-accent text-white rounded-full w-4 h-4 flex items-center justify-center text-[8px] font-bold border-[2px] border-[var(--nb-border-color)]">
              {unReadMumbles}
            </span>
          )}
        </div>
        {isBottomNav ? (
          <span className="text-[10px] font-bold">Mumbles</span>
        ) : (
          !isMobile && <span className="ml-2 font-bold">EchoMumble</span>
        )}
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
            <Link href="/mumbles/read" className="flex-1" onClick={() => setOpen(false)}>
              <button
                className="w-full h-24 flex flex-col items-center justify-center gap-2 rounded-xl transition-all duration-150 tap-interactive bg-card border-[3px] border-[var(--nb-border-color)] shadow-[var(--nb-shadow-sm)] hover:shadow-[var(--nb-shadow)] text-foreground"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-secondary/20 border-[2px] border-[var(--nb-border-color)]">
                  <Mail className="h-5 w-5 text-secondary" />
                </div>
                <span className="text-xs font-bold text-foreground">Inbox</span>
                <span className="text-[9px] text-muted-foreground font-medium -mt-1">Read your mumbles</span>
              </button>
            </Link>
          )}

          <Link href="/mumbles/send" className="flex-1" onClick={() => setOpen(false)}>
            <button
              className="w-full h-24 flex flex-col items-center justify-center gap-2 rounded-xl transition-all duration-150 tap-interactive bg-card border-[3px] border-[var(--nb-border-color)] shadow-[var(--nb-shadow-sm)] hover:shadow-[var(--nb-shadow)] text-foreground"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-nb-accent/20 border-[2px] border-[var(--nb-border-color)]">
                <Send className="h-5 w-5 text-nb-accent" />
              </div>
              <span className="text-xs font-bold text-foreground">Send</span>
              <span className="text-[9px] text-muted-foreground font-medium -mt-1">Whisper to someone</span>
            </button>
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
