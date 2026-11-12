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
import LoadError from "@/components/LoadError";

export default function BlockedUsersPage() {
  const dispatch = useDispatch();
  const { blockedUsers } = useSelector((state: RootState) => state.user);
  const [isPending, setIsPending] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const fetchBlockedUsers = async () => {
      try {
        setIsPending(true);
        setLoadError(false);
        const response = await getBlockedUsersApi();
        if (response?.data?.blockedUsers) {
          dispatch(setBlockedUsers(response.data.blockedUsers));
        }
      } catch (error) {
        console.error("Error fetching blocked users:", error);
        setLoadError(true);
      } finally {
        setIsPending(false);
      }
    };
    fetchBlockedUsers();
  }, [dispatch, reloadKey]);

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
      <div className="flex justify-between items-center border-b-[3px] border-[var(--nb-border-color)] pb-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
            Blocked Users
          </h2>
          <p className="text-sm text-muted-foreground font-medium mt-1">Manage individuals you have previously blocked</p>
        </div>
        {isPending && <Loader2 className="h-4 w-4 animate-spin text-foreground" />}
      </div>

      {loadError ? (
        <LoadError what="your blocked users" onRetry={() => setReloadKey((k) => k + 1)} />
      ) : isPending && (!blockedUsers || blockedUsers.length === 0) ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="overflow-hidden shadow-[var(--nb-shadow-sm)]">
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
        <div className="flex flex-col justify-center items-center text-center p-8 bg-muted/40 border-[3px] border-[var(--nb-border-color)] rounded-2xl min-h-[250px] animate-fade-in">
          <ShieldX className="h-6 w-6 text-muted-foreground mb-2" />
          <p className="text-foreground text-sm font-bold">No blocked users</p>
          <p className="text-sm text-muted-foreground mt-2">Users you block will appear in this list for you to manage.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {blockedUsers?.map((blockedUser: any) => (
            <Card key={blockedUser._id} className="overflow-hidden shadow-[var(--nb-shadow-sm)] card-interactive">
              <CardContent className="p-4 flex flex-col items-center text-center space-y-3">
                <Avatar className="h-14 w-14 border">
                  <AvatarImage src={blockedUser?.avatar?.url} />
                  <AvatarFallback className="bg-card text-nb-accent-text text-sm border">
                    {blockedUser.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <h4 className="text-xs font-semibold text-foreground">@{blockedUser.username}</h4>
                </div>

                <div className="w-full pt-2">
                  <Button
                    onClick={() => unBlockUser(blockedUser._id)}
                    className="w-full text-xs  flex items-center justify-center gap-2 tap-interactive"
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
