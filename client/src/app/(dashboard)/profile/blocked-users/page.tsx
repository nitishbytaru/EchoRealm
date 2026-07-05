"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { ShieldX, ShieldAlert, Loader2 } from "lucide-react";

import { getBlockedUsersApi, unBlockUserApi } from "@/api/friends.api";
import { setBlockedUsers, removeFromBlockedUsers } from "@/store/slices/user.slice";
import { RootState } from "@/store/store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-slate-900 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Blocked Users
          </h2>
          <p className="text-xs text-slate-500">Manage individuals you have previously blocked</p>
        </div>
        {isPending && <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />}
      </div>

      {blockedUsers?.length === 0 ? (
        <div className="flex flex-col justify-center items-center text-center p-8 bg-slate-950/20 border border-slate-900 rounded-3xl min-h-[250px]">
          <ShieldX className="h-8 w-8 text-slate-650 mb-2" />
          <p className="text-slate-500 text-sm font-medium">No blocked users</p>
          <p className="text-[10px] text-slate-650 mt-1">Users you block will appear in this list for you to manage.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {blockedUsers?.map((blockedUser: any) => (
            <Card key={blockedUser._id} className="bg-slate-900/20 border border-slate-900 overflow-hidden group">
              <CardContent className="p-5 flex flex-col items-center text-center space-y-4">
                <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border border-slate-800">
                  <AvatarImage src={blockedUser?.avatar?.url} />
                  <AvatarFallback className="bg-indigo-950 text-indigo-400 text-lg">
                    {blockedUser.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <h4 className="text-sm font-bold text-white">@{blockedUser.username}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">{blockedUser.email}</p>
                </div>

                <div className="w-full pt-2">
                  <Button
                    onClick={() => unBlockUser(blockedUser._id)}
                    className="w-full bg-indigo-500 hover:bg-indigo-600 text-white text-[10px] h-8 rounded-lg flex items-center justify-center gap-1.5"
                  >
                    <ShieldAlert className="h-3.5 w-3.5" />
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
