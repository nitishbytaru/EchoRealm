"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { Search, UserPlus, UserCheck, Eye, Loader2 } from "lucide-react";

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function FindUsersPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { resultOfSearchedUsers } = useSelector((state: RootState) => state.user);

  const search = useInputValidation("");
  const searchResults = useDebouncedSearchResults(search.value);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    dispatch(setResultOfSearchedUsers(searchResults));
  }, [dispatch, searchResults]);

  const addFriendFunc = async (selectedUser: any) => {
    try {
      setIsPending(true);
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
      toast.error("Failed to send friend request.");
    } finally {
      setIsPending(false);
    }
  };

  const viewProfileFunc = (viewProfileUserId: string) => {
    dispatch(setViewingProfileUserDetails(viewProfileUserId));
    router.push(`/profile/view/${viewProfileUserId}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-0.5 border-b-[3px] border-[var(--nb-border-color)] pb-4">
        <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
          Find Users
        </h2>
        <p className="text-sm text-muted-foreground font-medium mt-1">Discover new connections and expand your circles</p>
      </div>

      {/* Search Input Bar */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search members by username..."
          value={search.value}
          onChange={search.changeHandler}
          className="pl-9 bg-muted text-foreground placeholder:text-muted-foreground rounded-lg h-9 w-full text-xs"
        />
      </div>

      {isPending ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="overflow-hidden shadow-[var(--nb-shadow-sm)]">
              <CardContent className="p-4 flex flex-col items-center text-center space-y-3">
                <Skeleton className="h-14 w-14 rounded-full" />
                <div className="space-y-2 w-full flex flex-col items-center">
                  <Skeleton className="h-4 w-24 rounded-md" />
                  <Skeleton className="h-3 w-32 rounded-md" />
                </div>
                <div className="flex flex-col gap-2 w-full pt-2">
                  <Skeleton className="h-8 w-full rounded-lg" />
                  <Skeleton className="h-8 w-full rounded-lg" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : search.value ? (
        resultOfSearchedUsers?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {resultOfSearchedUsers.map((currUser: any, index: number) => {
              const isFriend = currUser?.userFriendData?.friends?.includes(user?._id);
              const hasSentRequest = currUser?.userFriendData?.pendingFriendRequests?.includes(user?._id);

              return (
                <Card key={index} className="overflow-hidden shadow-[var(--nb-shadow-sm)] card-interactive">
                  <CardContent className="p-4 flex flex-col items-center text-center space-y-3">
                    <Avatar className="h-14 w-14 border">
                      <AvatarImage src={currUser?.user?.avatar?.url} />
                      <AvatarFallback className="bg-card text-nb-accent-text text-sm border">
                        {currUser?.user?.username?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <h4 className="text-xs font-semibold text-foreground">@{currUser?.user?.username}</h4>
                    </div>

                    <div className="flex flex-col gap-2 w-full pt-2">
                      {isFriend ? (
                        <Button
                          disabled
                          variant="outline"
                          className="w-full text-xs  flex items-center justify-center gap-2"
                        >
                          <UserCheck className="h-4 w-4" />
                          Already Friends
                        </Button>
                      ) : hasSentRequest ? (
                        <Button
                          disabled
                          variant="outline"
                          className="w-full text-nb-accent-text/80 text-xs  flex items-center justify-center gap-2"
                        >
                          <UserCheck className="h-4 w-4" />
                          Request Sent
                        </Button>
                      ) : (
                        <Button
                          onClick={() => addFriendFunc(currUser.user)}
                          className="w-full text-xs  flex items-center justify-center gap-2 tap-interactive"
                        >
                          <UserPlus className="h-4 w-4" />
                          Add Friend
                        </Button>
                      )}

                      <Button
                        onClick={() => viewProfileFunc(currUser.user._id)}
                        variant="outline"
                        className="w-full text-muted-foreground hover:text-foreground text-xs  flex items-center justify-center gap-2 tap-interactive"
                      >
                        <Eye className="h-4 w-4" />
                        View Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center text-center p-8 bg-muted/40 border-[3px] border-[var(--nb-border-color)] rounded-2xl min-h-[200px] animate-fade-in">
            <p className="text-muted-foreground text-xs">No member found with username &quot;{search.value}&quot;</p>
          </div>
        )
      ) : (
        <div className="flex flex-col justify-center items-center text-center p-8 bg-muted/40 border-[3px] border-[var(--nb-border-color)] rounded-2xl min-h-[200px]">
          <p className="text-foreground text-sm font-bold">Find someone to talk to</p>
          <p className="text-sm text-muted-foreground font-medium mt-1">Type a username above to see who&apos;s here.</p>
        </div>
      )}
    </div>
  );
}
