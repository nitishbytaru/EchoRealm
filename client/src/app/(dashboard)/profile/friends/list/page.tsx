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
import ConfirmDialog from "@/components/ConfirmDialog";
import { Skeleton } from "@/components/ui/skeleton";

export default function MyFriendsPage() {
  const dispatch = useDispatch();
  const { myFriendsList } = useSelector((state: RootState) => state.user);

  const [isPending, setIsPending] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: "remove" | "block"; friend: any } | null>(null);

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
        toast.error("We couldn't load your friends. Refresh to try again.");
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
      <div className="flex justify-between items-center border-b-[3px] border-[var(--nb-border-color)] pb-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
            My Friends
          </h2>
          <p className="text-sm text-muted-foreground font-medium mt-1">Manage your active friendships and connections</p>
        </div>
        {isPending && <Loader2 className="h-4 w-4 animate-spin text-foreground" />}
      </div>

      {isPending && (!myFriendsList || myFriendsList.length === 0) ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="overflow-hidden shadow-[var(--nb-shadow-sm)]">
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
        <div className="flex flex-col justify-center items-center text-center p-8 bg-muted/40 border-[3px] border-[var(--nb-border-color)] rounded-2xl min-h-[250px] animate-fade-in">
          <Users className="h-6 w-6 text-muted-foreground mb-2" />
          <p className="text-muted-foreground text-xs font-semibold">No friends yet</p>
          <p className="text-xs text-muted-foreground mt-2">Use the &apos;Find Users&apos; tab to search and add friends.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {myFriendsList?.map((friend: any) => (
            <Card key={friend._id} className="overflow-hidden shadow-[var(--nb-shadow-sm)] card-interactive">
              <CardContent className="p-4 flex flex-col items-center text-center space-y-3">
                <Avatar className="h-14 w-14 border">
                  <AvatarImage src={friend?.avatar?.url} />
                  <AvatarFallback className="bg-card text-nb-accent-text text-sm border">
                    {friend.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <h4 className="text-xs font-semibold text-foreground">@{friend.username}</h4>
                </div>

                <div className="flex items-center gap-2 w-full pt-2">
                  <Button
                    onClick={() => setPendingAction({ type: "remove", friend })}
                    variant="outline"
                    className="flex-1 text-muted-foreground hover:text-foreground text-xs rounded-lg flex items-center gap-2 tap-interactive"
                  >
                    <UserMinus className="h-4 w-4" />
                    Unfriend
                  </Button>

                  <Button
                    onClick={() => setPendingAction({ type: "block", friend })}
                    variant="ghost"
                    className="flex-1 text-nb-danger-text hover:text-nb-danger-text  text-xs rounded-lg flex items-center gap-2 tap-interactive"
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

      <ConfirmDialog
        open={Boolean(pendingAction)}
        onOpenChange={(open) => !open && setPendingAction(null)}
        title={`${pendingAction?.type === "block" ? "Block" : "Unfriend"} @${pendingAction?.friend?.username ?? ""}?`}
        description={
          pendingAction?.type === "block"
            ? "They'll be removed from your friends and hidden from your search and inbox. You can unblock them under Blocked Users."
            : "You'll be removed from each other's friends. You can send a new request later."
        }
        confirmLabel={pendingAction?.type === "block" ? "Block" : "Unfriend"}
        onConfirm={() =>
          pendingAction?.type === "block"
            ? blockSender(pendingAction.friend._id)
            : removeFriend(pendingAction!.friend._id)
        }
      />
    </div>
  );
}
