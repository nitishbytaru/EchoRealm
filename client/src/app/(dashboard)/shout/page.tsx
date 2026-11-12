"use client";

import React, { useEffect, useRef, useState } from "react";
import Handle from "@/components/Handle";
import { useDispatch, useSelector } from "react-redux";
import { X, EyeOff } from "lucide-react";
import moment from "moment";
import { chipColor } from "@/components/chat/ChatMessage";
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
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ShoutLoading from "./components/ShoutLoading";
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

  const identityLabel = user?.isAnonymous ? "Posting anonymously" : `Posting as @${user?.username}`;

  // Last few distinct people who shouted, from the messages already loaded.
  const recentShouters: { name: string; time: string; isMe: boolean }[] = [];
  for (const msg of [...(messages || [])].reverse()) {
    if (!msg?.sender || recentShouters.some((s) => s.name === msg.sender)) continue;
    recentShouters.push({ name: msg.sender, time: msg.updatedAt, isMe: msg.sender === user?.username });
    if (recentShouters.length === 5) break;
  }

  return (
    <div className="grid h-app grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_17rem] xl:grid-cols-[minmax(0,1fr)_19rem]">
      {/* Feed */}
      <section aria-label="EchoShout feed" className="flex min-h-0 flex-col">
        <PageHeader
          title="Everyone hears"
          sticker="this."
          stickerFill="bg-secondary"
          description="One room for everybody. Keep it short and loud."
          className="mb-4 lg:hidden [&_h1]:text-2xl sm:[&_h1]:text-3xl"
        />

        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border-[3px] border-[var(--nb-border-color)] bg-card shadow-[var(--nb-shadow)]">
          {isFetching ? (
            <ShoutLoading />
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
            <div className="relative z-20 shrink-0 border-t-[3px] border-[var(--nb-border-color)] bg-muted/60 px-4 pt-3 pb-4">
              {selectSearchBar && (
                <div className="absolute right-3 bottom-full left-3 z-30 mx-auto mb-3 max-w-sm rounded-xl border-[3px] border-[var(--nb-border-color)] bg-card p-3 shadow-[var(--nb-shadow)]">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <label htmlFor="mention-search" className="text-sm font-bold text-foreground">
                      Mention someone
                    </label>
                    <button
                      type="button"
                      aria-label="Close mention search"
                      onClick={() => {
                        setSelectSearchBar(false);
                        search.clear();
                      }}
                      className="flex size-8 items-center justify-center rounded-lg border-[2px] border-transparent text-muted-foreground transition-colors hover:border-[var(--nb-border-color)] hover:bg-muted hover:text-foreground"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                  <Input
                    id="mention-search"
                    type="text"
                    autoFocus
                    placeholder="Search by username"
                    value={search.value}
                    onChange={search.changeHandler}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setSelectSearchBar(false);
                        search.clear();
                      }
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

              {mentions.length > 0 && (
              <div className="mb-2.5 flex flex-wrap items-center gap-2">
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
              )}

              <MessageBar
                onSend={sendShout}
                placeholder="Shout something, or type @ to mention"
                sendLabel="Post to EchoShout"
                onMentionTrigger={() => setSelectSearchBar(true)}
                leading={
                  <span className="group/identity relative shrink-0">
                    <Link
                      href="/profile/edit"
                      aria-label={`${identityLabel}. Change in your profile`}
                      className="flex size-9 items-center justify-center rounded-xl transition-colors hover:bg-muted"
                    >
                      {user?.isAnonymous ? (
                        <span className="flex size-7 items-center justify-center rounded-full border-[2px] border-[var(--nb-border-color)] bg-nb-accent text-on-color">
                          <EyeOff className="size-4" aria-hidden="true" />
                        </span>
                      ) : (
                        <Avatar size="sm" className="size-7 border-[2px] shadow-none">
                          <AvatarImage src={user?.avatar?.url} alt="" />
                          <AvatarFallback className="bg-secondary text-[0.6rem] font-extrabold text-on-color">
                            {user?.username?.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </Link>
                    <span
                      role="tooltip"
                      className="nb-reveal-x pointer-events-none absolute bottom-full left-0 z-30 mb-3 w-max max-w-60 rounded-xl border-[2px] border-[var(--nb-border-color)] bg-card px-3 py-2 shadow-[var(--nb-shadow-sm)]"
                    >
                      <span className="block text-sm font-bold text-foreground">{identityLabel}</span>
                      <span className="block text-xs font-medium text-muted-foreground">Click to change in your profile</span>
                    </span>
                  </span>
                }
              />
            </div>
          )}
        </div>
      </section>

      {/* Right rail */}
      <aside aria-label="About EchoShout" className="hidden min-h-0 flex-col gap-5 lg:flex">
        <PageHeader
          as="h2"
          title="Everyone hears"
          sticker="this."
          stickerFill="bg-secondary"
          description="One room for everybody. Keep it short and loud."
          className="[&_h2]:text-3xl"
        />
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

        {recentShouters.length > 0 && (
          <div className="rounded-2xl border-[3px] border-[var(--nb-border-color)] bg-card p-4 shadow-[var(--nb-shadow-sm)]">
            <p className="text-lg font-extrabold leading-tight text-foreground">
              Loud <span className="nb-sticker-word bg-primary">lately</span>
            </p>
            <ul className="mt-3 space-y-2.5">
              {recentShouters.map((shouter) => (
                <li key={shouter.name} className="flex items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className={`flex size-7 shrink-0 items-center justify-center rounded-full border-[2px] border-[var(--nb-border-color)] text-xs font-extrabold text-on-color ${chipColor(shouter.name)}`}
                  >
                    {shouter.name.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-bold text-foreground">
                    {shouter.isMe ? "You" : <Handle name={shouter.name} size="sm" />}
                  </span>
                  <time dateTime={shouter.time} className="shrink-0 text-xs font-semibold text-muted-foreground">
                    {moment(shouter.time).fromNow(true)}
                  </time>
                </li>
              ))}
            </ul>
          </div>
        )}

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
