"use client";

import React, { use, useRef, useState } from "react";
import ChatRooms from "../components/ChatRooms";
import ChatBox from "../components/ChatBox";

interface PageProps {
  params: Promise<{ recieverId: string }>;
}

export default function LinkDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // States to pass down to manage pagination and scrolling
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  const [gettingOldMessages, setGettingOldMessages] = useState(false);

  return (
    <div className="h-[calc(100vh-140px)] w-full flex overflow-hidden">
      {/* Grid Layout */}
      <div className="grid grid-cols-12 w-full h-full gap-4">
        {/* Left Side: Chat Rooms List (Hidden on mobile if a chat is active, visible on desktop) */}
        <div className="hidden md:block md:col-span-4 lg:col-span-3 bg-zinc-900/10 border border-zinc-900 rounded-xl p-4 overflow-y-auto hide-scrollBar">
          <ChatRooms />
        </div>

        {/* Right Side: Chat Box (Full width on mobile, right side on desktop) */}
        <div className="col-span-12 md:col-span-8 lg:col-span-9 bg-zinc-900/10 border border-zinc-900 rounded-xl p-4 overflow-y-auto flex flex-col justify-between hide-scrollBar">
          <ChatBox
            scrollRef={scrollRef}
            shouldScrollToBottom={shouldScrollToBottom}
            setShouldScrollToBottom={setShouldScrollToBottom}
            gettingOldMessages={gettingOldMessages}
          />
        </div>
      </div>
    </div>
  );
}
