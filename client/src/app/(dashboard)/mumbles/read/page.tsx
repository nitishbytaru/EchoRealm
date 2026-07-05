"use client";

import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pin, Trash2, MessageSquare, ShieldAlert, MoreVertical, Loader2 } from "lucide-react";

import Loading from "@/components/Loading";
import {
  deleteMumbleApi,
  getMumblesApi,
  pinMumbleApi,
  setMumblesAsReadApi,
} from "@/api/echo_mumble.api";
import {
  getBlockedUsersApi,
  handleRemoveOrBlockMyFriendApi,
} from "@/api/friends.api";
import {
  increaseNumberOfPinnedMumbles,
  removeMumble,
  setMumbles,
  setNumberOfPinnedMumbles,
  updateMumbles,
  setUnReadMumbles,
} from "@/store/slices/echo_mumble.slice";
import { RootState } from "@/store/store";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function ListenMumblesPage() {
  const isFirstRender = useRef(true);
  const dispatch = useDispatch();
  const router = useRouter();

  const { user } = useSelector((state: RootState) => state.auth);
  const { Mumbles, numberOfPinnedMumbles } = useSelector(
    (state: RootState) => state.echoMumble
  );

  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    const fetchMumblesAndBlocked = async () => {
      if (!user) return;
      try {
        setIsPending(true);
        const response = await getMumblesApi();
        const blockedUsersApiResponse = await getBlockedUsersApi();

        const myMumbles = response?.data?.mumbles.filter((mumble: any) => {
          return mumble.receiver?.toString() === user._id?.toString();
        });

        const blockedList = blockedUsersApiResponse?.data?.blockedUsers || [];
        const responseMumbles = myMumbles?.filter(
          (mumble: any) => !blockedList.includes(mumble?.sender)
        );

        const pinnedMumbles = response?.data?.mumbles?.filter(
          (mumble: any) => mumble?.pinned
        );

        dispatch(setNumberOfPinnedMumbles(pinnedMumbles?.length || 0));
        dispatch(
          setUnReadMumbles(
            responseMumbles?.filter((mumble: any) => mumble.mumbleStatus !== "read")
              .length || 0
          )
        );
        dispatch(setMumbles(responseMumbles || []));
      } catch (error) {
        console.error("Error fetching mumbles or blocked users:", error);
        toast.error("Failed to load mumbles.");
      } finally {
        setIsPending(false);
      }
    };
    fetchMumblesAndBlocked();
  }, [dispatch, user]);

  // useEffect for marking the unread mumbles as read
  useEffect(() => {
    const setAllMumblesAsReadApiFunc = async () => {
      try {
        await setMumblesAsReadApi();
        dispatch(setUnReadMumbles(0));
      } catch (err) {
        console.error("Error marking read:", err);
      }
    };

    return () => {
      if (isFirstRender.current) {
        isFirstRender.current = false;
      } else {
        if (Mumbles.length > 0) {
          setAllMumblesAsReadApiFunc();
        }
      }
    };
  }, [Mumbles, dispatch]);

  const confirmDeleteMumbleApiFunc = async (mumbleId: string) => {
    try {
      setIsPending(true);
      const response = await deleteMumbleApi(mumbleId);
      if (response?.data) {
        dispatch(removeMumble(mumbleId));
        toast.success(response.data?.message || "Mumble deleted.");
      }
    } catch (error) {
      console.error("Error deleting mumble:", error);
      toast.error("Failed to delete mumble.");
    } finally {
      setIsPending(false);
    }
  };

  const callDeleteMumbleFunc = (mumble: any) => {
    toast(`Delete mumble from @${mumble?.sender?.username || "anonymous"}?`, {
      action: {
        label: "Delete",
        onClick: () => confirmDeleteMumbleApiFunc(mumble._id),
      },
    });
  };

  const pinMumbleApiFunc = async (mumble: any) => {
    if (!mumble?.pinned && numberOfPinnedMumbles >= 5) {
      toast.error("Only 5 mumbles can be Pinned");
      return;
    }
    try {
      setIsPending(true);
      const response = await pinMumbleApi(mumble._id);
      if (response?.data) {
        dispatch(updateMumbles(response.data.updatedMumble));
        dispatch(increaseNumberOfPinnedMumbles());
        toast.success(response.data.message || "Pin status updated!");
      }
    } catch (error) {
      console.error("Error pinning mumble:", error);
      toast.error("Failed to pin mumble.");
    } finally {
      setIsPending(false);
    }
  };

  const blockSenderApiFunc = async (mumbleId: string, senderId: string) => {
    try {
      setIsPending(true);
      dispatch(removeMumble(mumbleId));
      const response = await handleRemoveOrBlockMyFriendApi({
        friendId: senderId,
        action: "block",
      });
      if (response?.data) {
        toast.success(response.data?.message || "Sender blocked successfully.");
      }
    } catch (error) {
      console.error("Error blocking sender:", error);
      toast.error("Failed to block sender.");
    } finally {
      setIsPending(false);
    }
  };

  if (isPending && Mumbles.length === 0) return <Loading />;

  return (
    <div className="flex-1 flex flex-col w-full max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center border-b border-slate-900 pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Inbox Mumbles
          </h2>
          <p className="text-xs text-slate-500">View whispers received from other users</p>
        </div>
        {isPending && <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />}
      </div>

      {Mumbles.length === 0 ? (
        <div className="flex-1 flex flex-col justify-center items-center text-center p-8 bg-slate-900/10 border border-slate-900 rounded-3xl min-h-[300px]">
          <p className="text-slate-500 text-sm font-medium">Your inbox is empty</p>
          <p className="text-[11px] text-slate-650 mt-1">No one has mumbled to you yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Mumbles.map((mumble: any) => {
            const isUnread = mumble.mumbleStatus === "sent";
            return (
              <Card
                key={mumble._id}
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-1 ${
                  isUnread
                    ? "bg-slate-900/60 border-indigo-500/30"
                    : "bg-slate-900/20 border-slate-900"
                }`}
              >
                {/* Pin indicator */}
                {mumble?.pinned && (
                  <div className="absolute top-3 left-3 text-indigo-400">
                    <Pin className="h-4 w-4 rotate-45 fill-indigo-400/20" />
                  </div>
                )}

                <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
                  <div className="flex items-center space-x-2 pl-5">
                    <span className="text-xs font-semibold text-slate-200">
                      @{mumble?.sender?.username || "anonymous"}
                    </span>
                    {isUnread && (
                      <span className="bg-indigo-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider scale-90">
                        New
                      </span>
                    )}
                  </div>

                  {/* Settings / Actions Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger render={
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white rounded-full">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    } />
                    <DropdownMenuContent className="bg-slate-950 border-slate-800 text-white w-48">
                      <DropdownMenuItem
                        onClick={() => pinMumbleApiFunc(mumble)}
                        className="hover:bg-slate-900 cursor-pointer text-xs flex gap-2"
                      >
                        <Pin className="h-3.5 w-3.5" />
                        {mumble?.pinned ? "Unpin this Mumble" : "Pin this Mumble"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => callDeleteMumbleFunc(mumble)}
                        className="hover:bg-slate-900 cursor-pointer text-xs text-rose-450 hover:text-rose-400 flex gap-2"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete Mumble
                      </DropdownMenuItem>
                      {mumble?.sender?.senderId && (
                        <>
                          <DropdownMenuItem
                            onClick={() => router.push(`/links/${mumble?.sender?.senderId}`)}
                            className="hover:bg-slate-900 cursor-pointer text-xs flex gap-2"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            Direct Message
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => blockSenderApiFunc(mumble?._id, mumble?.sender?.senderId)}
                            className="hover:bg-slate-900 cursor-pointer text-xs text-red-500 flex gap-2"
                          >
                            <ShieldAlert className="h-3.5 w-3.5" />
                            Block @{mumble?.sender?.username}
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>

                <CardContent className="px-4 pb-4 pt-1">
                  <p className="text-sm text-slate-300 leading-relaxed font-light whitespace-pre-wrap break-words">
                    {mumble?.message}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
