"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
    <div className="space-y-6">
      <div className="flex flex-col gap-1 border-b border-slate-900 pb-4">
        <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Find Users
        </h2>
        <p className="text-xs text-slate-500">Discover new connections and expand your circles</p>
      </div>

      {/* Search Input Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
        <Input
          type="text"
          placeholder="Search members by username..."
          value={search.value}
          onChange={search.changeHandler}
          className="pl-10 bg-slate-900 border-slate-800 focus-visible:ring-indigo-500 text-white rounded-xl h-10 w-full"
        />
      </div>

      {isPending && (
        <div className="flex justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-550" />
        </div>
      )}

      {!isPending && search.value && (
        <>
          {resultOfSearchedUsers?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {resultOfSearchedUsers.map((currUser: any, index: number) => {
                const isFriend = currUser?.userFriendData?.friends?.includes(user?._id);
                const hasSentRequest = currUser?.userFriendData?.pendingFriendRequests?.includes(user?._id);

                return (
                  <Card key={index} className="bg-slate-900/20 border border-slate-900 overflow-hidden group">
                    <CardContent className="p-5 flex flex-col items-center text-center space-y-4">
                      <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border border-slate-800">
                        <AvatarImage src={currUser?.user?.avatar?.url} />
                        <AvatarFallback className="bg-indigo-950 text-indigo-400 text-lg">
                          {currUser?.user?.username?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <h4 className="text-sm font-bold text-white">@{currUser?.user?.username}</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">{currUser?.user?.email}</p>
                      </div>

                      <div className="flex flex-col gap-2 w-full pt-2">
                        {isFriend ? (
                          <Button
                            disabled
                            className="w-full bg-slate-800/50 text-slate-400 text-[10px] h-8 rounded-lg flex items-center justify-center gap-1.5"
                          >
                            <UserCheck className="h-3.5 w-3.5" />
                            Already Friends
                          </Button>
                        ) : hasSentRequest ? (
                          <Button
                            disabled
                            className="w-full bg-slate-800/50 text-indigo-400/60 text-[10px] h-8 rounded-lg flex items-center justify-center gap-1.5"
                          >
                            <UserCheck className="h-3.5 w-3.5" />
                            Request Sent
                          </Button>
                        ) : (
                          <Button
                            onClick={() => addFriendFunc(currUser.user)}
                            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white text-[10px] h-8 rounded-lg flex items-center justify-center gap-1.5"
                          >
                            <UserPlus className="h-3.5 w-3.5" />
                            Add Friend
                          </Button>
                        )}

                        <Button
                          onClick={() => viewProfileFunc(currUser.user._id)}
                          variant="outline"
                          className="w-full bg-transparent border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white text-[10px] h-8 rounded-lg flex items-center justify-center gap-1.5"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View Profile
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center text-center p-8 bg-slate-950/20 border border-slate-900 rounded-3xl min-h-[200px]">
              <p className="text-slate-500 text-sm">No member found with username &quot;{search.value}&quot;</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
