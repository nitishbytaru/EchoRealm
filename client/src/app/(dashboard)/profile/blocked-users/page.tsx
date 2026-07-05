"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "@/hooks/use-toast";
import { ShieldX, ShieldAlert, Loader2 } from "lucide-react";

import { getBlockedUsersApi, unBlockUserApi } from "@/api/friends.api";
import { setBlockedUsers, removeFromBlockedUsers } from "@/store/slices/user.slice";
import { RootState } from "@/store/store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function BlockedUsersPage() {
  const dispatch = useDispatch();
  const { blockedUsers } = useSelector((state: RootState) => state.user);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    const fetchBlockedUsers = async () => {
      try {
        setIsPending(true);
        const response = await getBlockedUsersApi();
        if (response?.data?.blockedUsers) {
          dispatch(setBlockedUsers(response.data.blockedUsers));
        }
      } catch (error) {
        console.error("Error fetching blocked users:", error);
      } finally {
        setIsPending(false);
      }
    };
    fetchBlockedUsers();
  }, [dispatch]);

  const unBlockUser = async (userId: string) => {
    try {
      setIsPending(true);
      const response = await unBlockUserApi(userId);
      toast.success(response?.data?.message || "User unblocked successfully.");
      dispatch(removeFromBlockedUsers(userId));
    } catch (error) {
      console.error("Error unblocking user:", error);
      toast.error("Failed to unblock the user.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-100">
            Blocked Users
          </h2>
          <p className="text-[10px] text-zinc-555 mt-0.5">Manage individuals you have previously blocked</p>
        </div>
        {isPending && <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />}
      </div>

      {isPending && (!blockedUsers || blockedUsers.length === 0) ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="bg-zinc-900/10 border border-zinc-900 overflow-hidden rounded-xl">
              <CardContent className="p-4 flex flex-col items-center text-center space-y-3">
                <Skeleton className="h-14 w-14 rounded-full" />
                <div className="space-y-2 w-full flex flex-col items-center">
                  <Skeleton className="h-4 w-24 rounded-md" />
                  <Skeleton className="h-3 w-32 rounded-md" />
                </div>
                <div className="w-full pt-2">
                  <Skeleton className="h-8 w-full rounded-lg" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : blockedUsers?.length === 0 ? (
        <div className="flex flex-col justify-center items-center text-center p-8 bg-zinc-900/10 border border-zinc-900 rounded-xl min-h-[250px] animate-fade-in">
          <ShieldX className="h-6 w-6 text-zinc-600 mb-2" />
          <p className="text-zinc-500 text-xs font-semibold">No blocked users</p>
          <p className="text-[9px] text-zinc-650 mt-2">Users you block will appear in this list for you to manage.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {blockedUsers?.map((blockedUser: any) => (
            <Card key={blockedUser._id} className="bg-zinc-900/10 border border-zinc-900 overflow-hidden rounded-xl card-interactive">
              <CardContent className="p-4 flex flex-col items-center text-center space-y-3">
                <Avatar className="h-14 w-14 border border-zinc-800">
                  <AvatarImage src={blockedUser?.avatar?.url} />
                  <AvatarFallback className="bg-zinc-950 text-indigo-400 text-sm border border-zinc-900">
                    {blockedUser.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <h4 className="text-xs font-semibold text-zinc-200">@{blockedUser.username}</h4>
                  <p className="text-[9px] text-zinc-500 mt-0.5">{blockedUser.email}</p>
                </div>

                <div className="w-full pt-2">
                  <Button
                    onClick={() => unBlockUser(blockedUser._id)}
                    className="w-full bg-indigo-650 hover:bg-indigo-600 text-zinc-50 text-[10px] h-8 rounded-lg flex items-center justify-center gap-2 shadow-sm shadow-indigo-950/20 tap-interactive"
                  >
                    <ShieldAlert className="h-4 w-4" />
                    Unblock User
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
