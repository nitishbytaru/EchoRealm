"use client";

import React, { useRef } from "react";
import ChatRooms from "./components/ChatRooms";

export default function LinksPage() {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="h-[calc(100vh-140px)] w-full flex overflow-hidden">
      {/* Grid Layout */}
      <div className="grid grid-cols-12 w-full h-full gap-4">
        {/* Left Side: Chat Rooms List */}
        <div className="col-span-12 md:col-span-4 lg:col-span-3 bg-card border-[3px] border-[var(--nb-border-color)] shadow-[var(--nb-shadow)] rounded-2xl p-4 overflow-y-auto hide-scrollBar">
          <ChatRooms />
        </div>

        {/* Right Side: Chat Box Placeholder */}
        <div className="hidden md:flex md:col-span-8 lg:col-span-9 bg-card border-[3px] border-[var(--nb-border-color)] shadow-[var(--nb-shadow)] rounded-2xl p-6 items-center justify-center text-center">
          <div className="space-y-2 max-w-xs">
            <h3 className="text-base font-bold text-foreground">Your Conversations</h3>
            <p className="text-sm text-muted-foreground font-medium">
              Select a friend or group chat from the left sidebar to start whispering in private.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
