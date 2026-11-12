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
    <div className="h-app w-full flex">
      {/* Grid Layout */}
      <div className="grid h-full w-full grid-cols-1 gap-5 md:grid-cols-[19rem_minmax(0,1fr)] lg:grid-cols-[22rem_minmax(0,1fr)]">
        {/* Left Side: Chat Rooms List */}
        <div className="hidden md:block bg-card border-[3px] border-[var(--nb-border-color)] shadow-[var(--nb-shadow)] rounded-2xl p-4 overflow-hidden">
          <ChatRooms />
        </div>

        {/* Right Side: Chat Box */}
        <div className="bg-card border-[3px] border-[var(--nb-border-color)] shadow-[var(--nb-shadow)] rounded-2xl overflow-hidden flex flex-col">
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
