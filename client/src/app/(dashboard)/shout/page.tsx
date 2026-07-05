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

  if (isFetching) return <Loading />;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950/20 max-w-4xl mx-auto w-full relative">
      <div className="text-center py-4 border-b border-slate-900 mb-6">
        <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          EchoShout Feed
        </h2>
        <p className="text-xs text-slate-500">Shout out to the world in real-time</p>
      </div>

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
            <div className="absolute bottom-20 left-0 right-0 max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-5">
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Search users to mention..."
                  value={search.value}
                  onChange={search.changeHandler}
                  className="bg-slate-950 border-slate-800 focus-visible:ring-indigo-500 text-white"
                />
                
                {searchResults?.length > 0 && (
                  <ul className="max-h-40 overflow-y-auto divide-y divide-slate-850 pr-1">
                    {searchResults.map(({ user }) => (
                      <li
                        key={user._id}
                        onClick={() => {
                          addMentionFunc(user);
                          search.clear();
                        }}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user?.avatar?.url} />
                          <AvatarFallback className="bg-indigo-900 text-xs">{user.username.slice(0,2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-xs font-semibold text-white">@{user.username}</p>
                          <p className="text-[10px] text-slate-400">{user.email}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 bg-slate-950/80 backdrop-blur-md rounded-2xl border border-slate-900/60 p-2">
            {mentions.length > 0 && (
              <div className="absolute -top-10 left-3 flex gap-1.5 flex-wrap z-10 animate-in fade-in">
                {mentions.map((mention, index) => (
                  <span
                    key={index}
                    className="bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded-full text-xs font-medium"
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
              className={`font-bold h-10 w-10 p-0 rounded-full flex-shrink-0 ${
                selectSearchBar 
                  ? "bg-indigo-500 hover:bg-indigo-600 text-white" 
                  : "bg-slate-900 border-slate-800 hover:bg-slate-850 text-indigo-400"
              }`}
            >
              @
            </Button>

            <div className="w-full">
              {isUploading ? (
                <div className="flex items-center justify-center h-10">
                  <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
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
