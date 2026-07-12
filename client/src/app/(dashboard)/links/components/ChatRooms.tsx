"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Search, Plus, Loader2, MessageSquarePlus } from "lucide-react";

import socket from "@/sockets/socket";
import LoadingSpinner from "@/components/LoadingSpinner";
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
import { createUniquechatRoom, markAsRead, truncateMessage } from "@/utils/helpers/micro_funcs";
import { RootState } from "@/store/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const ChatRooms: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const params = useParams();
  const recieverId = params?.recieverId as string | undefined;

  const { user } = useSelector((state: RootState) => state.auth);
  const { myPrivateChatRooms } = useSelector((state: RootState) => state.echoLink);

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[] | null>(null);

  const [isPending, setIsPending] = useState(false);
  const [isGroupPending, setIsGroupPending] = useState(false);
  const [openCreateGroup, setOpenCreateGroup] = useState(false);

  useEffect(() => {
    const fetchMyPrivateFriends = async () => {
      try {
        setIsPending(true);
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
      } finally {
        setIsPending(false);
      }
    };

    fetchMyPrivateFriends();
  }, [dispatch, user?._id]);

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

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Search Header */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search active chats..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 text-sm"
          />

          {search && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border-[3px] border-[var(--nb-border-color)] rounded-xl shadow-[var(--nb-shadow)] max-h-60 overflow-y-auto z-50 p-2 space-y-1">
              {searchResults && searchResults.length > 0 ? (
                searchResults.map((searchUser) => (
                  <div
                    key={searchUser._id}
                    onClick={() => {
                      router.push(`/links/${searchUser._id}`);
                      if (searchUser?.groupProfile) {
                        joinGroupChat(searchUser._id);
                      } else {
                        joinPrivateChat(searchUser._id);
                      }
                      setSearch("");
                    }}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-primary/20 cursor-pointer transition-colors font-medium tap-interactive"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={searchUser?.avatar?.url} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-[10px]">
                        {searchUser.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-bold text-foreground">@{searchUser.username}</span>
                  </div>
                ))
              ) : (
                <div className="p-3 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                  <span className="font-medium">No user found</span>
                  <Link href="/profile/find-users">
                    <Button size="sm" className="bg-secondary text-secondary-foreground">
                      Find Friends
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        <Button
          size="icon"
          onClick={() => setOpenCreateGroup(true)}
          className="bg-card border-[3px] border-[var(--nb-border-color)] shadow-[var(--nb-shadow-sm)] text-nb-accent hover:text-foreground rounded-xl h-11 w-11 flex-shrink-0 tap-interactive"
          title="Create New Group"
        >
          <MessageSquarePlus className="h-5 w-5" />
        </Button>
      </div>

      <CreateGroupDialog
        open={openCreateGroup}
        onOpenChange={setOpenCreateGroup}
        isGroupPending={isGroupPending}
        startTransitionGroup={setIsGroupPending}
      />

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto pr-0.5 space-y-2 hide-scrollBar">
        {myPrivateChatRooms?.map((receiver: any, index: number) => {
          const isSelected = recieverId === receiver._id;
          const isUnread =
              receiver?.latestMessage?.receiver?.messageStatus === "sent" &&
              receiver?.latestMessage?.sender !== user?._id;

          return (
            <div
              key={index}
              onClick={() => {
                router.push(`/links/${receiver._id}`);
                if (receiver?.groupProfile) {
                  joinGroupChat(receiver._id);
                } else {
                  joinPrivateChat(receiver._id);
                }
                if (receiver.latestMessage) {
                  markAsRead(dispatch, setLatestMessageAsRead, receiver);
                }
              }}
              className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-150 border-[3px] tap-interactive ${
                isSelected
                  ? "bg-primary/10 border-[var(--nb-border-color)] shadow-[var(--nb-shadow-sm)] text-foreground"
                  : "bg-transparent border-transparent hover:bg-muted hover:border-[var(--nb-border-color)] text-foreground"
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden flex-1">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={receiver?.avatar?.url || receiver?.groupProfile?.url} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {(receiver?.username || receiver?.groupName)?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="overflow-hidden flex-1">
                  <h4 className="text-sm font-bold text-foreground truncate">
                    {receiver?.username ? `@${receiver.username}` : receiver?.groupName}
                  </h4>
                  {receiver.latestMessage ? (
                    <p
                      className={`text-xs mt-0.5 truncate font-medium ${
                        isUnread ? "text-secondary font-bold" : "text-muted-foreground"
                      }`}
                    >
                      {truncateMessage(receiver?.latestMessage?.message, 30)}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate font-medium">
                      {truncateMessage(
                        receiver?.groupChatRoomMembers?.map((m: any) => m.username).join(", ") || "",
                        30
                      )}
                    </p>
                  )}
                </div>
              </div>

              {/* Notification Dot */}
              {isUnread && (
                <div className="h-3 w-3 rounded-full bg-secondary border-[2px] border-[var(--nb-border-color)] ml-2 flex-shrink-0" />
              )}
            </div>
          );
        })}

        {myPrivateChatRooms?.length === 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground font-medium">
            No active conversations. Start one!
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatRooms;
