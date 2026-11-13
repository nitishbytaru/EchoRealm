"use client";

import React, { useEffect, useState } from "react";
import Handle from "@/components/Handle";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import moment from "moment";
import { Search, MessageSquare, MessageSquarePlus, UserPlus, Users } from "lucide-react";
import LoadError from "@/components/LoadError";

import socket from "@/sockets/socket";
import { Skeleton } from "@/components/ui/skeleton";
import { TypingBubble } from "@/components/brand/BrandMarks";
import CreateGroupDialog from "./GroupChat/CreateGroupDialog";
import {
  getGroupChatDetailsApi,
  getMyPrivateFriendsApi,
  getPrivateMessagesApi,
  searchEchoLinkFriendsApi,
} from "@/api/echo_link.api";
import {
  setMyPrivateChatRooms,
  setLatestMessageAsRead,
  addToChatRoomsWithUnreadMessages,
  addToMyPrivateChatRooms,
  setPrivateMessages,
  setPaginationDetails,
  removeFromChatRoomsWithUnreadMessages,
} from "@/store/slices/echo_link.slice";
import { createUniquechatRoom, markAsRead } from "@/utils/helpers/micro_funcs";
import { RootState } from "@/store/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const CHIP_COLORS = ["bg-primary", "bg-secondary", "bg-nb-accent", "bg-nb-success", "bg-nb-warning"];
const chipColor = (name?: string) =>
  CHIP_COLORS[[...(name || "?")].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % CHIP_COLORS.length];

/** "14:05" today, "Mon" this week, "12 Nov" otherwise. */
const shortTime = (iso: string) => {
  const m = moment(iso);
  if (m.isSame(moment(), "day")) return m.format("HH:mm");
  if (m.isAfter(moment().subtract(6, "days"))) return m.format("ddd");
  return m.format("D MMM");
};

export const ChatRooms: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const params = useParams();
  const recieverId = params?.recieverId as string | undefined;

  const { user } = useSelector((state: RootState) => state.auth);
  const { myPrivateChatRooms } = useSelector((state: RootState) => state.echoLink);

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const isSearching = Boolean(search) && searchResults === null;

  const [isPending, setIsPending] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [isGroupPending, setIsGroupPending] = useState(false);
  const [openCreateGroup, setOpenCreateGroup] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread" | "groups">("all");

  useEffect(() => {
    const fetchMyPrivateFriends = async () => {
      try {
        setIsPending(true);
        setLoadError(false);
        const response = await getMyPrivateFriendsApi();

        response?.data?.myPrivateFriendsWithMessages?.forEach((chatRoom: any) => {
          if (
            chatRoom?.latestMessage?.receiver?.messageStatus === "sent" &&
            chatRoom?.latestMessage?.sender !== user?._id
          ) {
            dispatch(addToChatRoomsWithUnreadMessages(chatRoom?.uniqueChatId));
          }
        });

        const sortedRooms = (response?.data?.myPrivateFriendsWithMessages || []).sort(
          (a: any, b: any) => {
            const dateA = new Date(a.latestMessage?.updatedAt || 0).getTime();
            const dateB = new Date(b.latestMessage?.updatedAt || 0).getTime();
            return dateB - dateA;
          }
        );

        dispatch(setMyPrivateChatRooms(sortedRooms));
      } catch (error) {
        console.error("Error fetching friends rooms:", error);
        setLoadError(true);
      } finally {
        setIsPending(false);
      }
    };

    fetchMyPrivateFriends();
  }, [dispatch, user?._id, reloadKey]);

  useEffect(() => {
    if (!user) return;

    const handleNewPrivateMessage = (senderData: any) => {
      if (
        !senderData?.uniqueChatId.includes(user._id) ||
        senderData?._id === user._id
      )
        return;

      if (senderData?._id !== recieverId) {
        dispatch(addToChatRoomsWithUnreadMessages(senderData?.uniqueChatId));
        dispatch(addToMyPrivateChatRooms(senderData));
      } else {
        markAsRead(dispatch, setLatestMessageAsRead, senderData);
      }
    };

    socket.on("new_privte_message_received", handleNewPrivateMessage);

    return () => {
      socket.off("new_privte_message_received", handleNewPrivateMessage);
    };
  }, [dispatch, recieverId, user]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (search) {
        searchEchoLinkFriendsApi(search)
          .then((users: any[]) => {
            const filteredUsers = users.filter((u) => u._id !== user?._id);
            setSearchResults(filteredUsers);
          })
          .catch((err) => console.error(err));
      } else {
        setSearchResults([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [search, user?._id]);

  const joinPrivateChat = async (targetId: string, page = 1) => {
    if (!user) return;
    const uniqueRoomId = createUniquechatRoom(targetId, user._id);
    dispatch(setPrivateMessages([]));

    if (page === 1) {
      socket.emit("joinEchoLink", uniqueRoomId);
      dispatch(removeFromChatRoomsWithUnreadMessages(uniqueRoomId));
    }

    try {
      const response = await getPrivateMessagesApi(uniqueRoomId, page);
      if (response?.data?.messages) {
        dispatch(setPrivateMessages(response.data.messages));
        dispatch(
          setPaginationDetails({
            roomId: uniqueRoomId,
            hasMoreMessages: response.data.hasMoreMessages,
            currentPage: page,
          })
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const joinGroupChat = async (targetId: string) => {
    dispatch(setPrivateMessages([]));
    try {
      const groupResponse = await getGroupChatDetailsApi(targetId);
      const groupDetails = groupResponse?.data?.groupDetails;

      if (groupDetails?._id) {
        const { _id, messages } = groupDetails;
        socket.emit("joinGroupChat", _id);
        dispatch(setPrivateMessages(messages));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openRoom = (receiver: any) => {
    router.push(`/links/${receiver._id}`);
    if (receiver?.groupProfile || receiver?.groupName) {
      joinGroupChat(receiver._id);
    } else {
      joinPrivateChat(receiver._id);
    }
    if (receiver.latestMessage) {
      markAsRead(dispatch, setLatestMessageAsRead, receiver);
    }
  };

  const isUnreadRoom = (room: any) =>
    room?.latestMessage?.receiver?.messageStatus === "sent" && room?.latestMessage?.sender !== user?._id;
  const isGroupRoom = (room: any) => Boolean(room?.groupName || room?.groupProfile);

  const rooms: any[] = myPrivateChatRooms || [];
  const unreadCount = rooms.filter(isUnreadRoom).length;
  const visibleRooms = rooms.filter((room) =>
    filter === "unread" ? isUnreadRoom(room) : filter === "groups" ? isGroupRoom(room) : true
  );

  const filters: { key: typeof filter; label: string; count?: number }[] = [
    { key: "all", label: "All" },
    { key: "unread", label: "Unread", count: unreadCount },
    { key: "groups", label: "Groups" },
  ];

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-2xl font-extrabold leading-tight tracking-tight text-foreground">
            Your <span className="nb-sticker-word bg-primary">chats.</span>
          </h2>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            {rooms.length === 1 ? "1 conversation" : `${rooms.length} conversations`}
            {unreadCount > 0 && ` · ${unreadCount} unread`}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Link
            href="/profile/friends/list"
            title="New chat"
            aria-label="Start a new chat"
            className="flex size-10 items-center justify-center rounded-xl border-2 border-[var(--nb-border-color)] bg-primary text-on-color shadow-[var(--nb-shadow-sm)] tap-interactive"
          >
            <MessageSquare className="h-5 w-5" aria-hidden="true" />
          </Link>
          <Button
            size="icon"
            onClick={() => setOpenCreateGroup(true)}
            className="size-10 shrink-0 rounded-xl border-2 border-[var(--nb-border-color)] bg-card text-foreground shadow-[var(--nb-shadow-sm)] tap-interactive"
            title="Create a group"
            aria-label="Create a group"
          >
            <MessageSquarePlus className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input
          type="text"
          placeholder="Search friends"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setSearchResults(null);
          }}
          onKeyDown={(e) => e.key === "Escape" && setSearch("")}
          aria-label="Search your friends"
          className="pl-10 text-base md:text-sm"
        />

        {search && (
          <div className="absolute top-full right-0 left-0 z-50 mt-2 max-h-60 space-y-1 overflow-y-auto rounded-xl border-2 border-[var(--nb-border-color)] bg-card p-2 shadow-[var(--nb-shadow)]">
            {isSearching ? (
              <p className="p-3 text-center text-sm font-medium text-muted-foreground">Searching…</p>
            ) : searchResults && searchResults.length > 0 ? (
              searchResults.map((searchUser) => (
                <button
                  type="button"
                  key={searchUser._id}
                  onClick={() => {
                    openRoom(searchUser);
                    setSearch("");
                  }}
                  className="flex w-full items-center gap-2 rounded-lg p-2 text-left font-medium transition-colors hover:bg-muted"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={searchUser?.avatar?.url} alt="" />
                    <AvatarFallback className={`text-xs font-bold text-on-color ${chipColor(searchUser.username)}`}>
                      {searchUser.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-bold text-foreground">@{searchUser.username}</span>
                </button>
              ))
            ) : (
              <div className="flex flex-col items-center gap-2 p-3 text-center text-sm text-muted-foreground">
                <span className="font-medium">No friends match that name.</span>
                <Link href="/profile/find-users" className="font-bold underline underline-offset-2">
                  Find new people
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filters */}
      <div role="group" aria-label="Filter chats" className="flex gap-2">
        {filters.map((f) => {
          const isActive = filter === f.key;
          return (
            <button
              key={f.key}
              type="button"
              aria-pressed={isActive}
              onClick={() => setFilter(f.key)}
              className={`flex h-9 items-center gap-1.5 rounded-lg border-[2px] px-3 text-sm font-bold transition-colors ${
                isActive
                  ? "border-[var(--nb-border-color)] bg-foreground text-background"
                  : "border-[var(--nb-border-color)] bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
              {f.count ? (
                <span className="rounded-md bg-destructive px-1.5 text-xs font-extrabold text-on-color">{f.count}</span>
              ) : null}
            </button>
          );
        })}
      </div>

      <CreateGroupDialog
        open={openCreateGroup}
        onOpenChange={setOpenCreateGroup}
        isGroupPending={isGroupPending}
        startTransitionGroup={setIsGroupPending}
      />

      {/* List */}
      <ul className="-mx-1 flex-1 space-y-2 overflow-y-auto px-1 pt-1 pb-2 hide-scrollBar">
        {isPending &&
          rooms.length === 0 &&
          Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="flex items-center gap-3 p-3">
              <Skeleton className="size-11 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3 rounded-md" />
                <Skeleton className="h-3 w-1/2 rounded-md" />
              </div>
            </li>
          ))}

        {visibleRooms.map((receiver: any, index: number) => {
          const isSelected = recieverId === receiver._id;
          const isUnread = isUnreadRoom(receiver);
          const isGroup = isGroupRoom(receiver);
          const name = receiver?.username ? `@${receiver.username}` : receiver?.groupName;
          const latest = receiver?.latestMessage;
          const preview = latest
            ? `${latest.sender === user?._id ? "You: " : ""}${latest.message || "Sent an image"}`
            : receiver?.groupChatRoomMembers?.map((m: any) => m.username).join(", ") || "Say hi";

          return (
            <li key={receiver._id || index}>
              <button
                type="button"
                aria-current={isSelected ? "page" : undefined}
                onClick={() => openRoom(receiver)}
                className={`flex w-full items-center gap-3 rounded-xl border-2 p-2.5 text-left transition-all duration-150 ${
                  isSelected
                    ? "border-[var(--nb-border-color)] bg-primary text-on-color shadow-[var(--nb-shadow-sm)]"
                    : isUnread
                    ? "border-[var(--nb-border-color)] bg-card text-foreground hover:bg-muted"
                    : "border-transparent text-foreground hover:border-[var(--nb-border-color)] hover:bg-muted"
                }`}
              >
                <span className="relative shrink-0">
                  <Avatar className="size-11">
                    <AvatarImage src={receiver?.avatar?.url || receiver?.groupProfile?.url} />
                    <AvatarFallback className={`text-sm font-extrabold text-on-color ${chipColor(name)}`}>
                      {(receiver?.username || receiver?.groupName)?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {isGroup && (
                    <span className="absolute -right-1.5 -bottom-1.5 flex size-5 items-center justify-center rounded-md border-[2px] border-[var(--nb-border-color)] bg-nb-success text-on-color">
                      <Users className="size-3" aria-hidden="true" />
                      <span className="sr-only">Group</span>
                    </span>
                  )}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline gap-2">
                    <span className="min-w-0 flex-1 truncate text-sm font-extrabold">{receiver?.username ? <Handle name={receiver.username} size="sm" className="max-w-full" /> : name}</span>
                    {latest?.updatedAt && (
                      <time
                        dateTime={latest.updatedAt}
                        className={`shrink-0 text-xs font-semibold ${isSelected ? "text-on-color/70" : "text-muted-foreground"}`}
                      >
                        {shortTime(latest.updatedAt)}
                      </time>
                    )}
                  </span>
                  <span className="mt-0.5 flex items-center gap-2">
                    <span
                      className={`min-w-0 flex-1 truncate text-sm ${
                        isSelected ? "font-semibold text-on-color/80" : isUnread ? "font-bold text-foreground" : "font-medium text-muted-foreground"
                      }`}
                    >
                      {preview}
                    </span>
                    {isUnread && !isSelected && (
                      <span className="shrink-0 rotate-2 rounded-md border-[2px] border-[var(--nb-border-color)] bg-secondary px-1.5 text-[0.7rem] font-extrabold uppercase text-on-color">
                        New
                        <span className="sr-only"> messages</span>
                      </span>
                    )}
                  </span>
                </span>
              </button>
            </li>
          );
        })}

        {loadError && (
          <li>
            <LoadError what="your chats" onRetry={() => setReloadKey((k) => k + 1)} />
          </li>
        )}

        {!loadError && !isPending && rooms.length > 0 && visibleRooms.length === 0 && (
          <li className="py-8 text-center text-sm font-medium text-muted-foreground">
            {filter === "unread" ? "You're all caught up." : "No group chats yet. Make one with the + button."}
          </li>
        )}

        {!loadError && !isPending && rooms.length === 0 && (
          <li className="flex flex-col items-center gap-3 py-8 text-center">
            <TypingBubble className="rotate-3" />
            <p className="text-sm font-medium text-muted-foreground">No chats yet. Add a friend to get started.</p>
            <Link
              href="/profile/find-users"
              className="inline-flex h-10 items-center gap-2 rounded-xl border-2 border-[var(--nb-border-color)] bg-primary px-4 text-sm font-bold text-on-color shadow-[var(--nb-shadow-sm)] tap-interactive"
            >
              <UserPlus className="h-4 w-4" />
              Find friends
            </Link>
          </li>
        )}
      </ul>
    </div>
  );
};

export default ChatRooms;
