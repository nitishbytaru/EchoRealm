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
              <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />
              <div className="space-y-2 w-48">
                <Skeleton className="h-4 w-16 rounded-lg" />
                <Skeleton className="h-14 w-full rounded-xl" />
              </div>
            </div>
          ))}
        </div>

        {/* MessageBar placeholder */}
        <div className="bg-card rounded-2xl border-[3px] border-[var(--nb-border-color)] shadow-[var(--nb-shadow-sm)] p-3 mt-4 flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-10 flex-1 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full max-w-4xl mx-auto w-full relative">
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
            <div className="absolute bottom-18 left-0 right-0 max-w-sm mx-auto bg-card border-[3px] border-[var(--nb-border-color)] rounded-xl p-4 shadow-[var(--nb-shadow)] animate-in slide-in-from-bottom-5">
              <div className="space-y-3">
                <Input
                  type="text"
                  placeholder="Search users to mention..."
                  value={search.value}
                  onChange={search.changeHandler}
                  className="text-sm"
                />
                
                {searchResults?.length > 0 && (
                  <ul className="max-h-40 overflow-y-auto space-y-1 hide-scrollBar">
                    {searchResults.map(({ user }) => (
                      <li
                        key={user._id}
                        onClick={() => {
                          addMentionFunc(user);
                          search.clear();
                        }}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary/20 cursor-pointer transition-colors"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user?.avatar?.url} />
                          <AvatarFallback className="bg-primary text-primary-foreground text-[10px]">{user.username.slice(0,2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-bold text-foreground">@{user.username}</p>
                          <p className="text-[10px] text-muted-foreground font-medium">{user.email}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 bg-card rounded-2xl border-[3px] border-[var(--nb-border-color)] shadow-[var(--nb-shadow-sm)] p-3">
            {mentions.length > 0 && (
              <div className="absolute -top-10 left-3 flex gap-2 flex-wrap z-10 animate-in fade-in">
                {mentions.map((mention, index) => (
                  <span
                    key={index}
                    className="bg-nb-accent/20 border-[2px] border-[var(--nb-border-color)] text-nb-accent px-3 py-1 rounded-xl text-xs font-bold"
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
              className={`font-extrabold h-10 w-10 p-0 rounded-xl flex-shrink-0 text-sm ${
                selectSearchBar 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-card text-nb-accent"
              }`}
            >
              @
            </Button>

            <div className="w-full">
              {isUploading ? (
                <div className="flex items-center justify-center h-10">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
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
