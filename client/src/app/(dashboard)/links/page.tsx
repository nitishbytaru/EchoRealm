"use client";

import React, { useRef } from "react";
import ChatRooms from "./components/ChatRooms";

export default function LinksPage() {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="h-[calc(100vh-140px)] w-full flex overflow-hidden">
      {/* Grid Layout */}
      <div className="grid grid-cols-12 w-full h-full gap-4">
        {/* Left Side: Chat Rooms List (Always visible on mobile/desktop since no chat is selected) */}
        <div className="col-span-12 md:col-span-4 lg:col-span-3 bg-zinc-900/10 border border-zinc-900 rounded-xl p-4 overflow-y-auto hide-scrollBar">
          <ChatRooms />
        </div>

        {/* Right Side: Chat Box Placeholder (Hidden on mobile, visible on desktop) */}
        <div className="hidden md:flex md:col-span-8 lg:col-span-9 bg-zinc-900/10 border border-zinc-900 rounded-xl p-4 items-center justify-center text-center">
          <div className="space-y-1 max-w-xs">
            <h3 className="text-xs font-semibold text-zinc-300">Your Conversations</h3>
            <p className="text-[10px] text-zinc-500">
              Select a friend or group chat from the left sidebar to start whispering in private.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
