"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-slate-900 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Friend Requests
          </h2>
          <p className="text-xs text-slate-500">Respond to incoming friend invitations</p>
        </div>
        {isPending && <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />}
      </div>

      {myFriendRequests?.length === 0 ? (
        <div className="flex flex-col justify-center items-center text-center p-8 bg-slate-950/20 border border-slate-900 rounded-3xl min-h-[250px]">
          <UserPlus2 className="h-8 w-8 text-slate-650 mb-2" />
          <p className="text-slate-500 text-sm font-medium">No pending requests</p>
          <p className="text-[10px] text-slate-650 mt-1">You will see new friend requests here when someone adds you.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {myFriendRequests?.map((requestUser: any) => (
            <Card key={requestUser._id} className="bg-slate-900/20 border border-slate-900 overflow-hidden group">
              <CardContent className="p-5 flex flex-col items-center text-center space-y-4">
                <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border border-slate-800">
                  <AvatarImage src={requestUser?.avatar?.url} />
                  <AvatarFallback className="bg-indigo-950 text-indigo-400 text-lg">
                    {requestUser.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <h4 className="text-sm font-bold text-white">@{requestUser.username}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">{requestUser.email}</p>
                </div>

                <div className="flex flex-col gap-2 w-full pt-2">
                  <div className="flex gap-2 w-full">
                    <Button
                      onClick={() => handleFriendRequest(requestUser._id, true)}
                      className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white text-[10px] h-8 rounded-lg flex items-center justify-center gap-1.5"
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                      Accept
                    </Button>
                    <Button
                      onClick={() => handleFriendRequest(requestUser._id, false)}
                      variant="ghost"
                      className="flex-1 text-slate-400 hover:text-white hover:bg-slate-900 text-[10px] h-8 rounded-lg flex items-center justify-center gap-1.5 border border-slate-800"
                    >
                      <UserX2 className="h-3.5 w-3.5" />
                      Reject
                    </Button>
                  </div>

                  <Button
                    onClick={() => viewProfileFunc(requestUser._id)}
                    variant="outline"
                    className="w-full bg-transparent border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white text-[10px] h-8 rounded-lg flex items-center justify-center gap-1.5"
                  >
                    <Eye className="h-3.5 w-3.5" />
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
