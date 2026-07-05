"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { UserCheck, UserX2, Eye, Loader2, UserPlus2 } from "lucide-react";

import {
  fetchMyFriendRequestsApi,
  handleFriendRequestApi,
} from "@/api/friends.api";
import {
  setMyFriendRequests,
  removeFromMyFriendRequests,
  addToMyFriendsList,
  setViewingProfileUserDetails,
} from "@/store/slices/user.slice";
import { RootState } from "@/store/store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function MyFriendRequestsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { myFriendRequests } = useSelector((state: RootState) => state.user);

  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setIsPending(true);
        const response = await fetchMyFriendRequestsApi();
        if (response?.data?.requests) {
          dispatch(setMyFriendRequests(response.data.requests));
        }
      } catch (error) {
        console.error("Error fetching friend requests:", error);
      } finally {
        setIsPending(false);
      }
    };
    fetchRequests();
  }, [dispatch]);

  const handleFriendRequest = async (requestedUserId: string, willAccept: boolean) => {
    try {
      setIsPending(true);
      const response = await handleFriendRequestApi({
        senderId: requestedUserId,
        action: willAccept ? "accept" : "reject",
      });

      if (willAccept) {
        dispatch(addToMyFriendsList(response?.data?.updatedMyFriendRequests));
      }

      dispatch(removeFromMyFriendRequests(requestedUserId));
      toast.success(response?.data?.message || `Friend request ${willAccept ? "accepted" : "rejected"}.`);
    } catch (error) {
      console.error("Error handling friend request:", error);
      toast.error("Failed to update friend request.");
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
      <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-100">
            Friend Requests
          </h2>
          <p className="text-[10px] text-zinc-555 mt-0.5">Respond to incoming friend invitations</p>
        </div>
        {isPending && <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />}
      </div>

      {isPending && (!myFriendRequests || myFriendRequests.length === 0) ? (
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
      ) : myFriendRequests?.length === 0 ? (
        <div className="flex flex-col justify-center items-center text-center p-8 bg-zinc-900/10 border border-zinc-900 rounded-xl min-h-[250px] animate-fade-in">
          <UserPlus2 className="h-6 w-6 text-zinc-650 mb-2" />
          <p className="text-zinc-500 text-xs font-semibold">No pending requests</p>
          <p className="text-[9px] text-zinc-650 mt-2">You will see new friend requests here when someone adds you.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {myFriendRequests?.map((requestUser: any) => (
            <Card key={requestUser._id} className="bg-zinc-900/10 border border-zinc-900 overflow-hidden rounded-xl card-interactive">
              <CardContent className="p-4 flex flex-col items-center text-center space-y-3">
                <Avatar className="h-14 w-14 border border-zinc-800">
                  <AvatarImage src={requestUser?.avatar?.url} />
                  <AvatarFallback className="bg-zinc-950 text-indigo-400 text-sm border border-zinc-900">
                    {requestUser.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <h4 className="text-xs font-semibold text-zinc-200">@{requestUser.username}</h4>
                  <p className="text-[9px] text-zinc-500 mt-0.5">{requestUser.email}</p>
                </div>

                <div className="flex flex-col gap-2 w-full pt-2">
                  <div className="flex gap-2 w-full">
                    <Button
                      onClick={() => handleFriendRequest(requestUser._id, true)}
                      className="flex-1 bg-indigo-650 hover:bg-indigo-600 text-zinc-50 text-[10px] h-8 rounded-lg flex items-center justify-center gap-2 shadow-sm shadow-indigo-950/20 tap-interactive"
                    >
                      <UserCheck className="h-4 w-4" />
                      Accept
                    </Button>
                    <Button
                      onClick={() => handleFriendRequest(requestUser._id, false)}
                      variant="ghost"
                      className="flex-1 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 text-[10px] h-8 rounded-lg flex items-center justify-center gap-2 border border-zinc-800 tap-interactive"
                    >
                      <UserX2 className="h-4 w-4" />
                      Reject
                    </Button>
                  </div>

                  <Button
                    onClick={() => viewProfileFunc(requestUser._id)}
                    variant="outline"
                    className="w-full bg-transparent border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-100 text-[10px] h-8 rounded-lg flex items-center justify-center gap-2 tap-interactive"
                  >
                    <Eye className="h-4 w-4" />
                    View Profile
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
