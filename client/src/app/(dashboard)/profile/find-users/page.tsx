"use client";

import React, { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";
import { Search, UserPlus, UserCheck, Eye, MessageSquare, Clock, Send, SearchX } from "lucide-react";
import PersonCard, { PeopleEmpty } from "@/components/people/PersonCard";
import { TypingBubble } from "@/components/brand/BrandMarks";
import { cn } from "@/lib/utils";

import socket from "@/sockets/socket";
import { sendFriendRequestApi } from "@/api/friends.api";
import { useDebouncedSearchResults } from "@/hooks/useDebouncedSearchResults";
import { useInputValidation } from "@/hooks/useInputValidation";
import {
  setResultOfSearchedUsers,
  setViewingProfileUserDetails,
  updateResultOfSearchedUsers,
} from "@/store/slices/user.slice";
import { RootState } from "@/store/store";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";

export default function FindUsersPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { resultOfSearchedUsers } = useSelector((state: RootState) => state.user);

  const search = useInputValidation("");
  const searchResults = useDebouncedSearchResults(search.value);
  const [sendingId, setSendingId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(setResultOfSearchedUsers(searchResults));
  }, [dispatch, searchResults]);

  const addFriendFunc = async (selectedUser: any) => {
    try {
      setSendingId(selectedUser?._id);
      const response = await sendFriendRequestApi(selectedUser?._id);
      if (response?.data?.myFriendRequests) {
        dispatch(updateResultOfSearchedUsers(response?.data?.myFriendRequests));

        socket.emit("friendRequestSent", {
          senderDetails: {
            senderId: user?._id,
            senderAvatar: user?.avatar,
            senderUsername: user?.username,
            requestSeen: false,
          },
          recipientId: selectedUser._id,
        });
      }

      toast.success(response?.data?.message || "Friend request sent!");
    } catch (error) {
      console.error("Error adding friend:", error);
      toast.error("Couldn't send that request. Try again.");
    } finally {
      setSendingId(null);
    }
  };

  const viewProfileFunc = (viewProfileUserId: string) => {
    dispatch(setViewingProfileUserDetails(viewProfileUserId));
    router.push(`/profile/view/${viewProfileUserId}`);
  };

  return (
    <div className="nb-stagger space-y-4 [--nb-stagger-start:150ms]">
      <PageHeader
        as="h2"
        title="Find"
        sticker="people"
        stickerFill="bg-primary"
        description="Search by username, then send a friend request."
        />

      {/* Big search */}
      <div className="relative max-w-xl">
        <Search className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input
          type="search"
          aria-label="Search people by username"
          placeholder="Search people by username"
          value={search.value}
          onChange={search.changeHandler}
          onKeyDown={(e) => e.key === "Escape" && search.clear()}
          className="h-12 pl-12 text-base"
        />
      </div>

      {search.value ? (
        resultOfSearchedUsers?.length > 0 ? (
          <ul className="grid grid-cols-1 gap-6 pt-2 sm:grid-cols-2 xl:grid-cols-3">
            {resultOfSearchedUsers.map((currUser: any, index: number) => {
              const person = currUser?.user;
              if (!person?.username) return null;
              const isMe = person._id === user?._id;
              const isFriend = currUser?.userFriendData?.friends?.includes(user?._id);
              const hasSentRequest = currUser?.userFriendData?.pendingFriendRequests?.includes(user?._id);
              const status = isMe ? "That's you" : isFriend ? "Friends" : hasSentRequest ? "Request sent" : null;
              return (
                <PersonCard
                  key={person._id || index}
                  index={index}
                  name={person.username}
                  avatarUrl={person?.avatar?.url}
                  stamp={
                    status ? (
                      <span
                        key={status}
                        className={cn(
                          "nb-pop inline-flex items-center gap-1 -rotate-6 rounded-md border-2 border-[var(--nb-border-color)] px-1.5 py-0.5 text-[0.65rem] font-extrabold uppercase tracking-wide text-on-color shadow-[2px_2px_0_var(--nb-shadow-color)]",
                          isFriend ? "bg-nb-success" : isMe ? "bg-primary" : "bg-nb-warning"
                        )}
                      >
                        {isFriend ? <UserCheck className="size-3" aria-hidden="true" /> : hasSentRequest ? <Send className="size-3" aria-hidden="true" /> : null}
                        {status}
                      </span>
                    ) : undefined
                  }
                  corner={
                    <Button variant="outline" size="icon-sm" className="bg-card" aria-label={`View @${person.username}'s profile`} title="View profile" onClick={() => viewProfileFunc(person._id)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  }
                >
                  {isMe ? null : isFriend ? (
                    <Link href={`/links/${person._id}`} className={cn(buttonVariants({}), "h-11 w-full")}>
                      <MessageSquare className="h-4 w-4" aria-hidden="true" />
                      Message
                    </Link>
                  ) : hasSentRequest ? (
                    <Button variant="outline" className="h-11 w-full" disabled>
                      <Clock className="h-4 w-4" aria-hidden="true" />
                      Waiting for a reply
                    </Button>
                  ) : (
                    <Button className="h-11 w-full bg-secondary text-on-color" loading={sendingId === person._id} onClick={() => addFriendFunc(person)}>
                      <UserPlus className="h-4 w-4" aria-hidden="true" />
                      Add friend
                    </Button>
                  )}
                </PersonCard>
              );
            })}
          </ul>
        ) : (
          <PeopleEmpty
            icon={<SearchX className="size-7" />}
            fill="bg-muted"
            title="No one by that name"
            text={`Nobody's called "${search.value}". Check the spelling or try part of the name.`}
          />
        )
      ) : (
        <PeopleEmpty
          icon={<Search className="size-7" />}
          fill="bg-secondary"
          title="Find someone to talk to"
          text="Type a username above to see who's on EchoRealm."
          decor={
            <>
              <TypingBubble className="absolute -top-4 -left-3 -rotate-6" />
              <TypingBubble tone="primary" className="absolute -right-3 -bottom-4 rotate-6" />
            </>
          }
        />
      )}
    </div>
  );
}
