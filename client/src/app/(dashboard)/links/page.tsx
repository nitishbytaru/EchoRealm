"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Megaphone, UserPlus } from "lucide-react";
import ChatRooms from "./components/ChatRooms";
import { MARK_SRC, Sparkle, TypingBubble } from "@/components/brand/BrandMarks";
import { buttonVariants } from "@/components/ui/button";

export default function LinksPage() {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="h-app w-full flex overflow-hidden">
      {/* Grid Layout */}
      <div className="grid h-full w-full grid-cols-1 gap-5 md:grid-cols-[19rem_minmax(0,1fr)] lg:grid-cols-[22rem_minmax(0,1fr)]">
        {/* Left Side: Chat Rooms List */}
        <div className="bg-card border-[3px] border-[var(--nb-border-color)] shadow-[var(--nb-shadow)] rounded-2xl p-4 overflow-hidden">
          <ChatRooms />
        </div>

        {/* Right Side: Chat Box Placeholder */}
        <div className="relative hidden overflow-hidden md:flex bg-card border-[3px] border-[var(--nb-border-color)] shadow-[var(--nb-shadow)] rounded-2xl p-6 items-center justify-center text-center">
          <div aria-hidden="true" className="nb-dotgrid absolute inset-0 opacity-60" />
          <div className="relative flex max-w-sm flex-col items-center">
            <div aria-hidden="true" className="relative mb-6">
              <Image src={MARK_SRC} alt="" width={682} height={502} className="nb-sticker-in h-auto w-44" style={{ ["--tilt" as string]: "-4deg" }} />
              <TypingBubble className="absolute -right-10 bottom-2 rotate-6" tone="primary" />
              <Sparkle className="absolute -top-2 -left-6 w-7" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
              Pick a <span className="nb-sticker-word bg-primary">chat.</span>
            </h2>
            <p className="mt-3 text-sm font-medium text-muted-foreground">
              Choose a friend or group from the list, or start something new.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/profile/find-users" className={buttonVariants({})}>
                <UserPlus className="h-4 w-4" aria-hidden="true" />
                Find friends
              </Link>
              <Link href="/shout" className={buttonVariants({ variant: "outline" })}>
                <Megaphone className="h-4 w-4" aria-hidden="true" />
                Shout to everyone
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
