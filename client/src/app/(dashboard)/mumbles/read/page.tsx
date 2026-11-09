"use client";

import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
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
  removeMumble,
  setMumbles,
  updateMumbles,
  setUnReadMumbles,
} from "@/store/slices/echo_mumble.slice";
import { RootState } from "@/store/store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function ListenMumblesPage() {
  const isFirstRender = useRef(true);
  const dispatch = useDispatch();
  const router = useRouter();

  const { user } = useSelector((state: RootState) => state.auth);
  const { Mumbles } = useSelector(
    (state: RootState) => state.echoMumble
  );

  const [isPending, setIsPending] = useState(false);
  const [mumbleToDelete, setMumbleToDelete] = useState<any>(null);
  const [senderToBlock, setSenderToBlock] = useState<any>(null);

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

  const pinMumbleApiFunc = async (mumble: any) => {
    if (!mumble?.pinned && Mumbles.filter((m: any) => m.pinned).length >= 4) {
      toast.error("You can pin up to 4 Mumbles. Unpin one to add another.");
      return;
    }
    try {
      setIsPending(true);
      const response = await pinMumbleApi(mumble._id);
      if (response?.data) {
        dispatch(updateMumbles(response.data.updatedMumble));
        toast.success(mumble?.pinned ? "Unpinned from your profile." : "Pinned to your profile.");
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
    <div className="flex-1 flex flex-col w-full max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-muted-foreground">Mumbles</h1>
          <p className="text-sm text-muted-foreground font-medium mt-1">Quiet notes people left for you</p>
        </div>
        {isPending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-label="Loading" />}
      </div>

      {Mumbles.length === 0 ? (
        <div className="flex-1 flex flex-col justify-center items-center text-center p-8 border-2 border-dashed border-muted-foreground/50 rounded-2xl min-h-[280px]">
          <p className="text-foreground text-sm font-bold">It&apos;s quiet in here</p>
          <p className="text-sm text-muted-foreground font-medium mt-1">When someone sends you a Mumble, it will appear here.</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Mumbles.map((mumble: any) => {
            const isUnread = mumble.mumbleStatus === "sent";
            const isAnonymous = !mumble?.sender?.senderId;
            return (
              <li
                key={mumble._id}
                className={`rounded-xl border-2 p-3 pl-4 ${isAnonymous ? "border-dashed" : "border-solid"} ${
                  isUnread ? "border-nb-accent bg-nb-accent/10" : "border-muted-foreground/50 bg-muted/30"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2 text-sm font-bold text-muted-foreground">
                    {mumble?.pinned && <Pin className="h-4 w-4 shrink-0 rotate-45 text-nb-accent-text" aria-label="Pinned" />}
                    <span className="truncate">{isAnonymous ? "Someone" : `@${mumble?.sender?.username}`}</span>
                    {isUnread && <span className="shrink-0 text-xs font-bold text-nb-accent-text">New</span>}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger render={
                      <Button variant="ghost" size="icon" aria-label="Mumble options" className="text-muted-foreground hover:text-foreground">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    } />
                    <DropdownMenuContent className="w-48">
                      <DropdownMenuItem onClick={() => pinMumbleApiFunc(mumble)}>
                        <Pin className="h-4 w-4" />
                        {mumble?.pinned ? "Unpin from profile" : "Pin to profile"}
                      </DropdownMenuItem>
                      {!isAnonymous && (
                        <DropdownMenuItem onClick={() => router.push(`/links/${mumble?.sender?.senderId}`)}>
                          <MessageSquare className="h-4 w-4" />
                          Message @{mumble?.sender?.username}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem variant="destructive" onClick={() => setMumbleToDelete(mumble)}>
                        <Trash2 className="h-4 w-4" />
                        Delete Mumble
                      </DropdownMenuItem>
                      {!isAnonymous && (
                        <DropdownMenuItem variant="destructive" onClick={() => setSenderToBlock(mumble)}>
                          <ShieldAlert className="h-4 w-4" />
                          Block @{mumble?.sender?.username}
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <p className="mt-1 pb-1 text-base leading-relaxed text-foreground font-medium whitespace-pre-wrap break-words">
                  {mumble?.message}
                </p>
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(mumbleToDelete)}
        onOpenChange={(open) => !open && setMumbleToDelete(null)}
        title="Delete this Mumble?"
        description="It will be removed from your inbox and your profile. This can't be undone."
        confirmLabel="Delete Mumble"
        onConfirm={() => confirmDeleteMumbleApiFunc(mumbleToDelete._id)}
      />
      <ConfirmDialog
        open={Boolean(senderToBlock)}
        onOpenChange={(open) => !open && setSenderToBlock(null)}
        title={`Block @${senderToBlock?.sender?.username ?? "this person"}?`}
        description="They'll be removed from your friends and hidden from your search and inbox. You can unblock them under Blocked Users."
        confirmLabel="Block"
        onConfirm={() => blockSenderApiFunc(senderToBlock._id, senderToBlock.sender.senderId)}
      />
    </div>
  );
}
