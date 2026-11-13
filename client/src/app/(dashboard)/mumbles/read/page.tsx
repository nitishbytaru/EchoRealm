"use client";

import React, { useEffect, useRef, useState } from "react";
import BusyBadge from "@/components/BusyBadge";
import { useUserAvatars } from "@/hooks/useUserAvatars";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";
import { Pin, Trash2, MessageSquare, ShieldAlert, MoreVertical, Send } from "lucide-react";

import PageHeader from "@/components/PageHeader";
import MumbleNote from "../components/MumbleNote";
import { Sparkle, TypingBubble } from "@/components/brand/BrandMarks";
import MumbleLoading from "../components/MumbleLoading";
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
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button, buttonVariants } from "@/components/ui/button";
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
  const [pinBusy, setPinBusy] = useState<{ id: string; state: "pinning" | "unpinning" } | null>(null);
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
    setPinBusy({ id: mumble._id, state: mumble?.pinned ? "unpinning" : "pinning" });
    try {
      const response = await pinMumbleApi(mumble._id);
      if (response?.data) {
        dispatch(updateMumbles(response.data.updatedMumble));
        toast.success(mumble?.pinned ? "Unpinned from your profile." : "Pinned to your profile.");
      }
    } catch (error) {
      console.error("Error pinning mumble:", error);
      toast.error(mumble?.pinned ? "Couldn't unpin that Mumble." : "Couldn't pin that Mumble.");
    } finally {
      setPinBusy(null);
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

  const isLoading = isPending && Mumbles.length === 0;
  const avatars = useUserAvatars(Mumbles.map((m: any) => m?.sender?.senderId));

  return (
    <div className="nb-stagger flex w-full flex-col gap-6 [--nb-stagger-start:100ms]">
      <PageHeader
        as="h2"
        title="Your inbox"
        description="Quiet notes people left for you. New ones are purple until you leave this page."
        action={isPending && !isLoading ? <BusyBadge /> : undefined}
      />

      {isLoading ? (
        <MumbleLoading />
      ) : Mumbles.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center py-10">
          <div className="relative w-full max-w-sm -rotate-2 rounded-2xl border-2 border-dashed border-[var(--nb-border-color)] bg-card p-8 text-center shadow-[var(--nb-shadow)]">
            <TypingBubble className="absolute -top-5 -right-4 rotate-6" />
            <Sparkle className="absolute -bottom-4 -left-3 w-8" />
            <p className="text-2xl font-extrabold text-foreground">It&apos;s quiet in here</p>
            <p className="mt-2 text-sm font-medium text-muted-foreground">
              When someone sends you a Mumble, it lands here as a little note.
            </p>
            <Link href="/mumbles/send" className={buttonVariants({ className: "mt-5 bg-nb-accent text-on-color" })}>
              <Send className="h-4 w-4" aria-hidden="true" />
              Send a Mumble
            </Link>
          </div>
        </div>
      ) : (
        <ul className="columns-1 gap-6 pt-4 sm:columns-2 xl:columns-3">
          {Mumbles.map((mumble: any, index: number) => {
            const isAnonymous = !mumble?.sender?.senderId;
            return (
              <li key={mumble._id} className="nb-sticker-in mb-7 break-inside-avoid" style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}>
                <MumbleNote
                  index={index}
                  message={mumble?.message}
                  sender={isAnonymous ? null : mumble?.sender?.username}
                  isUnread={mumble.mumbleStatus === "sent"}
                  isPinned={Boolean(mumble?.pinned)}
                  pinState={pinBusy && pinBusy.id === mumble._id ? pinBusy.state : undefined}
                  avatarUrl={avatars[mumble?.sender?.senderId]}
                  time={mumble?.createdAt || mumble?.updatedAt}
                  likes={mumble?.likes?.length || 0}
                  action={
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon-sm" aria-label="Mumble options" className="text-current">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>{isAnonymous ? "From Anonymous" : `From @${mumble?.sender?.username}`}</DropdownMenuLabel>
                        </DropdownMenuGroup>
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
                        <DropdownMenuSeparator />
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
                  }
                />
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
