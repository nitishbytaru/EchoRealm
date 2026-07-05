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

  // Initialize with 'a' to show some users initially, like in the original app
  const search = useInputValidation("a");
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
      <div className="flex flex-col gap-0.5 border-b border-zinc-900 pb-4">
        <h2 className="text-xl font-bold tracking-tight text-zinc-100">
          Find Users
        </h2>
        <p className="text-[10px] text-zinc-555 mt-0.5">Discover new connections and expand your circles</p>
      </div>

      {/* Search Input Bar */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <Input
          type="text"
          placeholder="Search members by username..."
          value={search.value}
          onChange={search.changeHandler}
          className="pl-9 bg-zinc-900 border-zinc-800 focus-visible:ring-indigo-500 text-zinc-50 placeholder:text-zinc-650 rounded-lg h-9 w-full text-xs"
        />
      </div>

      {isPending ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="bg-zinc-900/10 border border-zinc-900 overflow-hidden rounded-xl">
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
                <Card key={index} className="bg-zinc-900/10 border border-zinc-900 overflow-hidden rounded-xl card-interactive">
                  <CardContent className="p-4 flex flex-col items-center text-center space-y-3">
                    <Avatar className="h-14 w-14 border border-zinc-800">
                      <AvatarImage src={currUser?.user?.avatar?.url} />
                      <AvatarFallback className="bg-zinc-950 text-indigo-400 text-sm border border-zinc-900">
                        {currUser?.user?.username?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <h4 className="text-xs font-semibold text-zinc-200">@{currUser?.user?.username}</h4>
                      <p className="text-[9px] text-zinc-500 mt-0.5">{currUser?.user?.email}</p>
                    </div>

                    <div className="flex flex-col gap-2 w-full pt-2">
                      {isFriend ? (
                        <Button
                          disabled
                          variant="outline"
                          className="w-full text-[10px] h-8 rounded-lg flex items-center justify-center gap-2"
                        >
                          <UserCheck className="h-4 w-4" />
                          Already Friends
                        </Button>
                      ) : hasSentRequest ? (
                        <Button
                          disabled
                          variant="outline"
                          className="w-full text-indigo-400/80 text-[10px] h-8 rounded-lg flex items-center justify-center gap-2"
                        >
                          <UserCheck className="h-4 w-4" />
                          Request Sent
                        </Button>
                      ) : (
                        <Button
                          onClick={() => addFriendFunc(currUser.user)}
                          className="w-full bg-indigo-650 hover:bg-indigo-600 text-zinc-50 text-[10px] h-8 rounded-lg flex items-center justify-center gap-2 shadow-sm shadow-indigo-950/20 tap-interactive"
                        >
                          <UserPlus className="h-4 w-4" />
                          Add Friend
                        </Button>
                      )}

                      <Button
                        onClick={() => viewProfileFunc(currUser.user._id)}
                        variant="outline"
                        className="w-full bg-transparent border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-100 text-[10px] h-8 rounded-lg flex items-center justify-center gap-2 tap-interactive"
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
          <div className="flex flex-col justify-center items-center text-center p-8 bg-zinc-900/10 border border-zinc-900 rounded-xl min-h-[200px] animate-fade-in">
            <p className="text-zinc-500 text-xs">No member found with username &quot;{search.value}&quot;</p>
          </div>
        )
      ) : null}
    </div>
  );
}
