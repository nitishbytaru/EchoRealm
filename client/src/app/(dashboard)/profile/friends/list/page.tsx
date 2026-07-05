"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "@/hooks/use-toast";
import { Users, UserMinus, ShieldAlert, Loader2 } from "lucide-react";

import {
  handleRemoveOrBlockMyFriendApi,
  getMyFriendsListApi,
} from "@/api/friends.api";
import {
  removeFromMyFriendsList,
  setToMyFriendsList,
} from "@/store/slices/user.slice";
import { RootState } from "@/store/store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function MyFriendsPage() {
  const dispatch = useDispatch();
  const { myFriendsList } = useSelector((state: RootState) => state.user);

  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    const fetchMyFriendsList = async () => {
      try {
        setIsPending(true);
        const { data } = await getMyFriendsListApi();
        if (data?.myFriendList?.friends) {
          dispatch(setToMyFriendsList(data.myFriendList.friends));
        }
      } catch (error) {
        console.error("Error fetching friends list:", error);
      } finally {
        setIsPending(false);
      }
    };
    fetchMyFriendsList();
  }, [dispatch]);

  const blockSender = async (friendId: string) => {
    try {
      setIsPending(true);
      const response = await handleRemoveOrBlockMyFriendApi({
        friendId,
        action: "block",
      });
      toast.success(response?.data?.message || "Friend blocked successfully.");
      dispatch(removeFromMyFriendsList(friendId));
    } catch (error) {
      console.error("Error blocking sender:", error);
      toast.error("Failed to block friend.");
    } finally {
      setIsPending(false);
    }
  };

  const removeFriend = async (friendId: string) => {
    try {
      setIsPending(true);
      const response = await handleRemoveOrBlockMyFriendApi({
        friendId,
        action: "remove",
      });
      toast.success(response?.data?.message || "Friend removed successfully.");
      dispatch(removeFromMyFriendsList(friendId));
    } catch (error) {
      console.error("Error removing friend:", error);
      toast.error("Failed to remove friend.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-100">
            My Friends
          </h2>
          <p className="text-[10px] text-zinc-555 mt-0.5">Manage your active friendships and connections</p>
        </div>
        {isPending && <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />}
      </div>

      {isPending && (!myFriendsList || myFriendsList.length === 0) ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="bg-zinc-900/10 border border-zinc-900 overflow-hidden rounded-xl">
              <CardContent className="p-4 flex flex-col items-center text-center space-y-3">
                <Skeleton className="h-14 w-14 rounded-full" />
                <div className="space-y-2 w-full flex flex-col items-center">
                  <Skeleton className="h-4 w-24 rounded-md" />
                  <Skeleton className="h-3 w-32 rounded-md" />
                </div>
                <div className="flex items-center gap-2 w-full pt-2">
                  <Skeleton className="h-8 flex-1 rounded-lg" />
                  <Skeleton className="h-8 flex-1 rounded-lg" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : myFriendsList?.length === 0 ? (
        <div className="flex flex-col justify-center items-center text-center p-8 bg-zinc-900/10 border border-zinc-900 rounded-xl min-h-[250px] animate-fade-in">
          <Users className="h-6 w-6 text-zinc-650 mb-2" />
          <p className="text-zinc-500 text-xs font-semibold">No friends yet</p>
          <p className="text-[9px] text-zinc-650 mt-2">Use the &apos;Find Users&apos; tab to search and add friends.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {myFriendsList?.map((friend: any) => (
            <Card key={friend._id} className="bg-zinc-900/10 border border-zinc-900 overflow-hidden rounded-xl card-interactive">
              <CardContent className="p-4 flex flex-col items-center text-center space-y-3">
                <Avatar className="h-14 w-14 border border-zinc-800">
                  <AvatarImage src={friend?.avatar?.url} />
                  <AvatarFallback className="bg-zinc-950 text-indigo-400 text-sm border border-zinc-900">
                    {friend.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <h4 className="text-xs font-semibold text-zinc-200">@{friend.username}</h4>
                  <p className="text-[9px] text-zinc-500 mt-0.5">{friend.email}</p>
                </div>

                <div className="flex items-center gap-2 w-full pt-2">
                  <Button
                    onClick={() => removeFriend(friend._id)}
                    variant="outline"
                    className="flex-1 bg-transparent border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 text-[10px] h-8 rounded-lg flex items-center gap-2 tap-interactive"
                  >
                    <UserMinus className="h-4 w-4" />
                    Unfriend
                  </Button>

                  <Button
                    onClick={() => blockSender(friend._id)}
                    variant="ghost"
                    className="flex-1 text-rose-400 hover:text-rose-350 hover:bg-rose-500/5 text-[10px] h-8 rounded-lg flex items-center gap-2 tap-interactive"
                  >
                    <ShieldAlert className="h-4 w-4" />
                    Block
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
