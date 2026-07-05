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
  const [pressedBtn, setPressedBtn] = useState<"read" | "send" | null>(null);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={isBottomNav 
        ? "flex flex-col items-center justify-center gap-1 w-full h-full text-muted-foreground hover:text-foreground relative tap-interactive"
        : "flex items-center gap-2 cursor-pointer w-full text-left tap-interactive"
      }>
        <div className="relative">
          <MessageCircle className="h-5 w-5" />
          {unReadMumbles > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center text-[8px] font-bold shadow-md">
              {unReadMumbles}
            </span>
          )}
        </div>
        {isBottomNav ? (
          <span className="text-[10px] font-medium">Mumbles</span>
        ) : (
          !isMobile && <span className="ml-2">EchoMumble</span>
        )}
      </DialogTrigger>

      {/* Dialog panel — nm-raised in light, default dark shadow in dark */}
      <DialogContent
        className="sm:max-w-md rounded-2xl border-0 text-foreground"
        style={{
          background: "var(--background)",
          boxShadow: "var(--nm-raised, 0 8px 32px rgba(0,0,0,0.25))",
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-center text-sm font-bold text-foreground tracking-tight">
            EchoMumble
          </DialogTitle>
        </DialogHeader>

        {/* Subtitle */}
        <p className="text-center text-[10px] text-muted-foreground -mt-2 pb-1">
          Choose an action
        </p>

        <div className="flex flex-col sm:flex-row gap-3 py-2">
          {isLoggedIn && (
            <Link href="/mumbles/read" className="flex-1" onClick={() => setOpen(false)}>
              <button
                onMouseDown={() => setPressedBtn("read")}
                onMouseUp={() => setPressedBtn(null)}
                onMouseLeave={() => setPressedBtn(null)}
                className="w-full h-20 flex flex-col items-center justify-center gap-2 rounded-xl transition-all duration-150 tap-interactive"
                style={{
                  background: "var(--background)",
                  boxShadow:
                    pressedBtn === "read"
                      ? "var(--nm-inset, inset 0 2px 8px rgba(0,0,0,0.2))"
                      : "var(--nm-raised, 0 4px 12px rgba(0,0,0,0.15))",
                  color: "var(--foreground)",
                  border: "none",
                }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{
                    background: "var(--background)",
                    boxShadow: "var(--nm-flat, 0 2px 6px rgba(0,0,0,0.12))",
                  }}
                >
                  <Mail className="h-4 w-4 text-indigo-500" />
                </div>
                <span className="text-[11px] font-semibold text-foreground">Inbox</span>
                <span className="text-[9px] text-muted-foreground -mt-1">Read your mumbles</span>
              </button>
            </Link>
          )}

          <Link href="/mumbles/send" className="flex-1" onClick={() => setOpen(false)}>
            <button
              onMouseDown={() => setPressedBtn("send")}
              onMouseUp={() => setPressedBtn(null)}
              onMouseLeave={() => setPressedBtn(null)}
              className="w-full h-20 flex flex-col items-center justify-center gap-2 rounded-xl transition-all duration-150 tap-interactive"
              style={{
                background: "var(--background)",
                boxShadow:
                  pressedBtn === "send"
                    ? "var(--nm-inset, inset 0 2px 8px rgba(0,0,0,0.2))"
                    : "var(--nm-raised, 0 4px 12px rgba(0,0,0,0.15))",
                color: "var(--foreground)",
                border: "none",
              }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{
                  background: "var(--background)",
                  boxShadow: "var(--nm-flat, 0 2px 6px rgba(0,0,0,0.12))",
                }}
              >
                <Send className="h-4 w-4 text-indigo-500" />
              </div>
              <span className="text-[11px] font-semibold text-foreground">Send</span>
              <span className="text-[9px] text-muted-foreground -mt-1">Whisper to someone</span>
            </button>
          </Link>
        </div>

        <div className="flex justify-end pt-1">
          <DialogClose
            render={
              <button
                className="text-[11px] text-muted-foreground hover:text-foreground px-4 h-8 rounded-lg transition-all duration-150 tap-interactive"
                style={{
                  background: "var(--background)",
                  boxShadow: "var(--nm-flat, 0 2px 5px rgba(0,0,0,0.1))",
                  border: "none",
                }}
              >
                Close
              </button>
            }
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MumbleIcon;
