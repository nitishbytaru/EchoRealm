"use client";

import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Loader2 } from "lucide-react";

import socket from "@/sockets/socket";
import Loading from "@/components/Loading";
import { getEchoShoutsApi } from "@/api/echo_shout.api";
import MessageBar from "@/components/MessageBar";
import ChatHistoryBox from "./components/ChatHistoryBox";
import { sendEchoShoutMessage } from "@/utils/helpers/micro_funcs";
import { useDebouncedSearchResults } from "@/hooks/useDebouncedSearchResults";
import { useInputValidation } from "@/hooks/useInputValidation";
import {
  addEchoShoutMessage,
  addOlderShouts,
  setEchoShoutMessages,
  setPaginationDetails,
} from "@/store/slices/echo_shout.slice";
import { RootState } from "@/store/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export default function EchoShoutPage() {
  const dispatch = useDispatch();

  const { isLoggedIn } = useSelector((state: RootState) => state.auth);
  const { messages, pagination } = useSelector((state: RootState) => state.echoShout);

  const [mentions, setMentions] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectSearchBar, setSelectSearchBar] = useState(false);
  const [echoShoutMessageData, setEchoShoutMessageData] = useState<any>(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);

  const loading = useRef(false);
  const shoutScrollRef = useRef<HTMLDivElement | null>(null);

  const [isFetching, setIsFetching] = useState(false);
  const [gettingOldMessages, setGettingOldMessages] = useState(false);

  const search = useInputValidation("");
  const searchResults = useDebouncedSearchResults(search.value);

  // Listen for new messages
  useEffect(() => {
    const handleNewMessage = (latestMessage: any) => {
      dispatch(addEchoShoutMessage(latestMessage));
      setShouldScrollToBottom(true);
    };

    socket.on("send_latest_echoShout_message", handleNewMessage);

    return () => {
      socket.off("send_latest_echoShout_message", handleNewMessage);
    };
  }, [dispatch]);

  // Fetch messages on mount
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setIsFetching(true);
        const response = await getEchoShoutsApi();
        dispatch(setEchoShoutMessages(response?.data?.messages || []));
        dispatch(
          setPaginationDetails({
            hasMoreMessages: response.data.hasMoreMessages,
            currentPage: response.data.page,
          })
        );
        setShouldScrollToBottom(true);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchMessages();
  }, [dispatch]);

  // Handle sending new messages
  useEffect(() => {
    if (echoShoutMessageData) {
      setIsUploading(true);
      sendEchoShoutMessage(
        setSelectSearchBar,
        mentions,
        echoShoutMessageData,
        setMentions,
        setEchoShoutMessageData,
        setIsUploading
      );
    }
  }, [dispatch, echoShoutMessageData, mentions]);

  function addMentionFunc(mentionedUser: any) {
    setMentions((prev) => [...prev, mentionedUser]);
    setSelectSearchBar(false);
  }

  // Load older messages on scroll
  useEffect(() => {
    const loadOlderMessages = async () => {
      if (!pagination?.hasMoreMessages || loading.current) return;

      loading.current = true;
      const nextPage = (pagination?.currentPage || 1) + 1;
      try {
        setGettingOldMessages(true);
        const response = await getEchoShoutsApi(nextPage);

        if (response?.data?.messages) {
          dispatch(addOlderShouts(response.data.messages));
          dispatch(
            setPaginationDetails({
              hasMoreMessages: response.data.hasMoreMessages,
              currentPage: nextPage,
            })
          );
        }
      } catch (error) {
        console.error("Error loading older messages:", error);
      } finally {
        setGettingOldMessages(false);
        loading.current = false;
      }
    };

    const scrollElement = shoutScrollRef.current;

    const handleScroll = () => {
      if (scrollElement && scrollElement.scrollTop === 0) {
        setShouldScrollToBottom(false);
        loadOlderMessages();
      }
    };

    if (scrollElement) {
      scrollElement.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (scrollElement) {
        scrollElement.removeEventListener("scroll", handleScroll);
      }
    };
  }, [pagination, dispatch, messages]);

  if (isFetching) {
    return (
      <div className="flex-1 flex flex-col h-full max-w-4xl mx-auto w-full relative">
        {/* Skeleton message list */}
        <div className="flex-1 space-y-4 py-4 overflow-hidden flex flex-col justify-end">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 max-w-[70%] ${
                i % 2 === 0 ? "self-start" : "self-end flex-row-reverse"
              }`}
            >
              <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
              <div className="space-y-1.5 w-48">
                <Skeleton className="h-3.5 w-16 rounded-md" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            </div>
          ))}
        </div>

        {/* MessageBar placeholder */}
        <div className="bg-zinc-950/85 backdrop-blur-md rounded-xl border border-zinc-900/80 p-2 mt-4 flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 flex-1 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950/10 max-w-4xl mx-auto w-full relative">
      {/* Scrollable Messages Section */}
      <div className="flex-1 flex flex-col min-h-0">
        <ChatHistoryBox
          shoutScrollRef={shoutScrollRef}
          shouldScrollToBottom={shouldScrollToBottom}
          messages={messages}
          gettingOldMessages={gettingOldMessages}
        />
      </div>

      {/* MessageBar for Sending Messages */}
      {isLoggedIn && (
        <div className="relative mt-4 z-20">
          {selectSearchBar && (
            <div className="absolute bottom-18 left-0 right-0 max-w-sm mx-auto bg-zinc-900 border border-zinc-800 rounded-lg p-3 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-5">
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Search users to mention..."
                  value={search.value}
                  onChange={search.changeHandler}
                  className="bg-zinc-950 border-zinc-800 focus-visible:ring-indigo-500 text-zinc-100 placeholder:text-zinc-650 text-xs h-9 rounded-lg"
                />
                
                {searchResults?.length > 0 && (
                  <ul className="max-h-40 overflow-y-auto divide-y divide-zinc-850 pr-0.5 hide-scrollBar">
                    {searchResults.map(({ user }) => (
                      <li
                        key={user._id}
                        onClick={() => {
                          addMentionFunc(user);
                          search.clear();
                        }}
                        className="flex items-center gap-2 p-2 rounded-md hover:bg-zinc-800 cursor-pointer transition-colors"
                      >
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={user?.avatar?.url} />
                          <AvatarFallback className="bg-zinc-950 text-indigo-400 text-[10px] border border-zinc-850">{user.username.slice(0,2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-xs font-semibold text-zinc-200">@{user.username}</p>
                          <p className="text-[9px] text-zinc-500">{user.email}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 bg-zinc-950/80 backdrop-blur-md rounded-xl border border-zinc-900/80 p-2">
            {mentions.length > 0 && (
              <div className="absolute -top-9 left-2 flex gap-2 flex-wrap z-10 animate-in fade-in">
                {mentions.map((mention, index) => (
                  <span
                    key={index}
                    className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full text-[10px] font-medium"
                  >
                    @{mention?.username}
                  </span>
                ))}
              </div>
            )}
            
            <Button
              type="button"
              variant={selectSearchBar ? "default" : "outline"}
              onClick={() => setSelectSearchBar((prev) => !prev)}
              className={`font-semibold h-8 w-8 p-0 rounded-lg flex-shrink-0 text-xs ${
                selectSearchBar 
                  ? "bg-indigo-650 hover:bg-indigo-600 text-zinc-50" 
                  : "bg-zinc-900 border-zinc-800 hover:bg-zinc-850 text-indigo-400"
              }`}
            >
              @
            </Button>

            <div className="w-full">
              {isUploading ? (
                <div className="flex items-center justify-center h-8">
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                </div>
              ) : (
                <MessageBar setMessageData={setEchoShoutMessageData} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
