"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
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
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-slate-900 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            My Friends
          </h2>
          <p className="text-xs text-slate-500">Manage your active friendships and connections</p>
        </div>
        {isPending && <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />}
      </div>

      {myFriendsList?.length === 0 ? (
        <div className="flex flex-col justify-center items-center text-center p-8 bg-slate-950/20 border border-slate-900 rounded-3xl min-h-[250px]">
          <Users className="h-8 w-8 text-slate-650 mb-2" />
          <p className="text-slate-500 text-sm font-medium">No friends yet</p>
          <p className="text-[10px] text-slate-650 mt-1">Use the &apos;Find Users&apos; tab to search and add friends.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {myFriendsList?.map((friend: any) => (
            <Card key={friend._id} className="bg-slate-900/20 border border-slate-900 overflow-hidden group">
              <CardContent className="p-5 flex flex-col items-center text-center space-y-4">
                <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border border-slate-800">
                  <AvatarImage src={friend?.avatar?.url} />
                  <AvatarFallback className="bg-indigo-950 text-indigo-400 text-lg">
                    {friend.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <h4 className="text-sm font-bold text-white">@{friend.username}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">{friend.email}</p>
                </div>

                <div className="flex items-center gap-2 w-full pt-2">
                  <Button
                    onClick={() => removeFriend(friend._id)}
                    variant="outline"
                    className="flex-1 bg-transparent border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900 text-[10px] h-8 rounded-lg flex items-center gap-1.5"
                  >
                    <UserMinus className="h-3.5 w-3.5" />
                    Unfriend
                  </Button>

                  <Button
                    onClick={() => blockSender(friend._id)}
                    variant="ghost"
                    className="flex-1 text-rose-450 hover:text-white hover:bg-rose-500/10 text-[10px] h-8 rounded-lg flex items-center gap-1.5"
                  >
                    <ShieldAlert className="h-3.5 w-3.5" />
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
