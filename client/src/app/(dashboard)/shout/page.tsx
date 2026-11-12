"use client";

import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X } from "lucide-react";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";

import socket from "@/sockets/socket";
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
import PageHeader from "@/components/PageHeader";
import { ShoutLines, Sparkle, TypingBubble } from "@/components/brand/BrandMarks";

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

  const identity = user?.isAnonymous ? "anonymous" : `@${user?.username}`;

  return (
    <div className="grid h-app grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_17rem] xl:grid-cols-[minmax(0,1fr)_19rem]">
      {/* Feed */}
      <section aria-label="EchoShout feed" className="flex min-h-0 flex-col">
        <PageHeader
          title="Everyone hears"
          sticker="this."
          stickerFill="bg-secondary"
          description="One room for everybody. Keep it short and loud."
          className="mb-4 [&_h1]:text-2xl sm:[&_h1]:text-3xl"
        />

        <div className="relative flex min-h-0 flex-1 flex-col rounded-2xl border-[3px] border-[var(--nb-border-color)] bg-card shadow-[var(--nb-shadow)]">
          {isFetching ? (
            <div className="flex flex-1 flex-col justify-end gap-4 overflow-hidden p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={`flex w-full ${i % 2 ? "justify-end" : "justify-start"}`}>
                  <Skeleton className="h-16 w-2/3 rounded-2xl sm:w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <ChatHistoryBox
              shoutScrollRef={shoutScrollRef}
              shouldScrollToBottom={shouldScrollToBottom}
              messages={messages}
              gettingOldMessages={gettingOldMessages}
            />
          )}

          {/* Composer dock: always pinned to the bottom of the feed */}
          {isLoggedIn && (
            <div className="relative z-20 rounded-b-[13px] border-t-[3px] border-[var(--nb-border-color)] bg-card p-3 sm:p-4">
              {selectSearchBar && (
                <div className="absolute right-3 bottom-full left-3 z-30 mx-auto mb-3 max-w-sm rounded-xl border-[3px] border-[var(--nb-border-color)] bg-card p-3 shadow-[var(--nb-shadow)]">
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
                    onKeyDown={(e) => {
                      if (e.key === "Escape") setSelectSearchBar(false);
                    }}
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
                              <AvatarFallback className="bg-secondary text-xs text-on-color">
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

              <div className={`mb-2 flex flex-wrap items-center gap-2 ${mentions.length ? "" : "lg:hidden"}`}>
                <p className="text-sm font-bold text-muted-foreground lg:hidden">
                  Posting as {identity}{" "}
                  <Link href="/profile/edit" className="underline underline-offset-2 hover:text-foreground">
                    Change
                  </Link>
                </p>
                {mentions.map((mention) => (
                  <span
                    key={mention._id}
                    className="inline-flex items-center gap-1 rounded-xl border-[2px] border-[var(--nb-border-color)] bg-secondary pl-2 text-xs font-bold text-on-color"
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
                    variant={selectSearchBar ? "secondary" : "outline"}
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
      </section>

      {/* Right rail */}
      <aside aria-label="About EchoShout" className="hidden min-h-0 flex-col gap-5 lg:flex">
        <div className="rounded-2xl border-[3px] border-[var(--nb-border-color)] bg-card p-4 shadow-[var(--nb-shadow-sm)]">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Posting as</p>
          <div className="mt-3 flex items-center gap-3">
            <Avatar>
              {!user?.isAnonymous && <AvatarImage src={user?.avatar?.url} />}
              <AvatarFallback className="bg-secondary text-xs font-bold text-on-color">
                {user?.isAnonymous ? "?" : user?.username?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-base font-extrabold text-foreground">{identity}</p>
              <Link href="/profile/edit" className="text-sm font-bold text-nb-link underline underline-offset-2">
                Change in profile
              </Link>
            </div>
          </div>
        </div>

        <div className="relative rounded-2xl border-[3px] border-[var(--nb-border-color)] bg-secondary p-4 text-on-color shadow-[var(--nb-shadow-sm)]">
          <ShoutLines className="absolute -top-4 -left-5 w-10 rotate-[200deg]" />
          <p className="text-lg font-extrabold leading-tight">How shouting works</p>
          <ul className="mt-3 space-y-2 text-sm font-semibold">
            <li className="flex gap-2"><Sparkle className="mt-0.5 w-3.5 shrink-0 [animation:none]" />Everyone signed in sees every shout.</li>
            <li className="flex gap-2"><Sparkle className="mt-0.5 w-3.5 shrink-0 [animation:none]" />Up to 55 characters per shout.</li>
            <li className="flex gap-2"><Sparkle className="mt-0.5 w-3.5 shrink-0 [animation:none]" />Type @ to mention someone. They get a heads-up.</li>
            <li className="flex gap-2"><Sparkle className="mt-0.5 w-3.5 shrink-0 [animation:none]" />Add one image with the paperclip.</li>
          </ul>
        </div>

        <div aria-hidden="true" className="relative mt-auto hidden h-28 xl:block">
          <TypingBubble className="absolute bottom-6 left-6 -rotate-3" />
          <TypingBubble tone="primary" className="absolute right-10 bottom-14 rotate-2" />
          <Sparkle className="absolute right-4 bottom-2 w-7" />
          <Sparkle className="absolute top-0 left-24 w-5" style={{ animationDelay: "1.2s" }} />
        </div>
      </aside>
    </div>
  );
}
