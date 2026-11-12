"use client";

import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X } from "lucide-react";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";

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

  const { isLoggedIn, user } = useSelector((state: RootState) => state.auth);
  const { messages, pagination } = useSelector((state: RootState) => state.echoShout);

  const [mentions, setMentions] = useState<any[]>([]);
  const [selectSearchBar, setSelectSearchBar] = useState(false);
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
        toast.error("We couldn't load EchoShout. Refresh to try again.");
      } finally {
        setIsFetching(false);
      }
    };

    fetchMessages();
  }, [dispatch]);

  const sendShout = async (data: FormData) => {
    await sendEchoShoutMessage(mentions, data);
    setMentions([]);
    setSelectSearchBar(false);
  };

  function addMentionFunc(mentionedUser: any) {
    setMentions((prev) => (prev.some((m) => m._id === mentionedUser._id) ? prev : [...prev, mentionedUser]));
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
      <div className="flex-1 flex flex-col h-[calc(100dvh-168px)] md:h-[calc(100dvh-112px)] lg:h-[calc(100dvh-128px)] max-w-3xl mx-auto w-full relative">
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
        <div className="mt-3 flex items-center gap-3 border-t-[3px] border-[var(--nb-border-color)] pt-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-10 flex-1 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-[calc(100dvh-168px)] md:h-[calc(100dvh-112px)] lg:h-[calc(100dvh-128px)] max-w-3xl mx-auto w-full relative">
      <h1 className="mb-3 text-3xl font-black uppercase tracking-tight text-foreground sm:text-4xl">Everyone hears this</h1>

      {/* Scrollable Messages Section */}
      <div className="flex-1 flex flex-col min-h-0">
        <ChatHistoryBox
          shoutScrollRef={shoutScrollRef}
          shouldScrollToBottom={shouldScrollToBottom}
          messages={messages}
          gettingOldMessages={gettingOldMessages}
        />
      </div>

      {isLoggedIn && (
        <div className="relative z-20 mt-3 border-t-[3px] border-[var(--nb-border-color)] pt-3">
          {selectSearchBar && (
            <div className="absolute right-0 bottom-full left-0 z-30 mx-auto mb-2 max-w-sm rounded-xl border-[3px] border-[var(--nb-border-color)] bg-card p-3 shadow-[var(--nb-shadow)]">
              <label htmlFor="mention-search" className="mb-2 block text-sm font-bold text-foreground">
                Mention someone
              </label>
              <Input
                id="mention-search"
                type="text"
                autoFocus
                placeholder="Search by username"
                value={search.value}
                onChange={search.changeHandler}
                className="text-base md:text-sm"
              />
              {searchResults?.length > 0 && (
                <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto hide-scrollBar">
                  {searchResults.map(({ user: candidate }) => (
                    <li key={candidate._id}>
                      <button
                        type="button"
                        onClick={() => {
                          addMentionFunc(candidate);
                          search.clear();
                        }}
                        className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-muted"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={candidate?.avatar?.url} alt="" />
                          <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                            {candidate.username.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="min-w-0 truncate text-sm font-bold text-foreground">@{candidate.username}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="mb-2 flex flex-wrap items-center gap-2">
            <p className="text-sm font-bold text-muted-foreground">
              Posting as {user?.isAnonymous ? "anonymous" : `@${user?.username}`}{" "}
              <Link href="/profile/edit" className="underline underline-offset-2 hover:text-foreground">
                Change
              </Link>
            </p>
            {mentions.map((mention) => (
              <span
                key={mention._id}
                className="inline-flex items-center gap-1 rounded-xl border-[2px] border-[var(--nb-border-color)] bg-secondary pl-2 text-xs font-bold text-secondary-foreground"
              >
                @{mention?.username}
                <button
                  type="button"
                  aria-label={`Remove mention of ${mention?.username}`}
                  onClick={() => setMentions((prev) => prev.filter((m) => m._id !== mention._id))}
                  className="flex size-7 items-center justify-center"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>

          <MessageBar
            onSend={sendShout}
            placeholder="Shout something, or type @ to mention"
            sendLabel="Post to EchoShout"
            onMentionTrigger={() => setSelectSearchBar(true)}
            leading={
              <Button
                type="button"
                variant={selectSearchBar ? "default" : "outline"}
                size="icon-lg"
                aria-label="Mention someone"
                aria-expanded={selectSearchBar}
                onClick={() => setSelectSearchBar((prev) => !prev)}
                className="shrink-0 rounded-xl text-base font-extrabold"
              >
                @
              </Button>
            }
          />
        </div>
      )}
    </div>
  );
}
