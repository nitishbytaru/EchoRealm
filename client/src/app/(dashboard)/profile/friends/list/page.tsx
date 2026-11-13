"use client";

import React, { useEffect, useState } from "react";
import BusyBadge from "@/components/BusyBadge";
import PageHeader from "@/components/PageHeader";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";
import { Users, UserMinus, ShieldAlert, MessageSquare, MoreVertical, MessageCircle, Eye, Search } from "lucide-react";
import PersonCard from "@/components/people/PersonCard";
import moment from "moment";
import { useRouter } from "next/navigation";
import { getMyPrivateFriendsApi } from "@/api/echo_link.api";
import { TypingBubble } from "@/components/brand/BrandMarks";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

import {
  handleRemoveOrBlockMyFriendApi,
  getMyFriendsListApi,
} from "@/api/friends.api";
import {
  removeFromMyFriendsList,
  setToMyFriendsList,
} from "@/store/slices/user.slice";
import { RootState } from "@/store/store";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ConfirmDialog from "@/components/ConfirmDialog";
import LoadError from "@/components/LoadError";

export default function MyFriendsPage() {
  const dispatch = useDispatch();
  const { myFriendsList } = useSelector((state: RootState) => state.user);
  const { user } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  const [isPending, setIsPending] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [pendingAction, setPendingAction] = useState<{ type: "remove" | "block"; friend: any } | null>(null);
  const [filter, setFilter] = useState("");
  const [lastMessages, setLastMessages] = useState<Record<string, any>>({});

  // Last message with each friend, from the existing chat list.
  useEffect(() => {
    getMyPrivateFriendsApi()
      .then((response) => {
        const map: Record<string, any> = {};
        (response?.data?.myPrivateFriendsWithMessages || []).forEach((room: any) => {
          if (room?._id && room?.latestMessage) map[room._id] = room.latestMessage;
        });
        setLastMessages(map);
      })
      .catch((error) => console.error("Error loading last messages:", error));
  }, []);
  const visibleFriends = (myFriendsList || []).filter((f: any) => f?.username?.toLowerCase().includes(filter.trim().toLowerCase()));

  useEffect(() => {
    const fetchMyFriendsList = async () => {
      try {
        setIsPending(true);
        setLoadError(false);
        const { data } = await getMyFriendsListApi();
        if (data?.myFriendList?.friends) {
          dispatch(setToMyFriendsList(data.myFriendList.friends));
        }
      } catch (error) {
        console.error("Error fetching friends list:", error);
        setLoadError(true);
      } finally {
        setIsPending(false);
      }
    };
    fetchMyFriendsList();
  }, [dispatch, reloadKey]);

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
    <div className="nb-stagger space-y-4 [--nb-stagger-start:150ms]">
      <PageHeader
        as="h2"
        title="Your"
        sticker="friends"
        stickerFill="bg-primary"
        description="The people you chat with and see Mumbles from."
        action={isPending ? <BusyBadge /> : undefined}
        />

      {!loadError && (myFriendsList?.length ?? 0) > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <span className="rotate-[-2deg] rounded-lg border-2 border-[var(--nb-border-color)] bg-secondary px-2.5 py-1 text-sm font-extrabold text-on-color shadow-[2px_2px_0_var(--nb-shadow-color)]">
            {myFriendsList.length} {myFriendsList.length === 1 ? "friend" : "friends"}
          </span>
          <div className="relative min-w-0 flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              type="search"
              aria-label="Filter your friends"
              placeholder="Filter friends"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && setFilter("")}
              className="h-10 pl-9 text-base md:text-sm"
            />
          </div>
        </div>
      )}

      {loadError ? (
        <LoadError what="your friends" onRetry={() => setReloadKey((k) => k + 1)} />
      ) : isPending && (!myFriendsList || myFriendsList.length === 0) ? (
        <div className="grid grid-cols-1 gap-6 pt-2 sm:grid-cols-2 xl:grid-cols-3" aria-label="Loading friends">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="nb-ghost-row overflow-hidden rounded-2xl border-2 border-dashed border-[var(--nb-line)]" style={{ animationDelay: `${i * 110}ms` }}>
              <div className="nb-ghost h-16 rounded-none border-0" />
              <div className="flex flex-col items-center gap-3 px-4 pb-5">
                <span className="nb-ghost -mt-10 block size-20 rounded-full" />
                <span className="nb-ghost block h-4 w-28 rounded-md" />
                <span className="nb-ghost block h-10 w-full rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : myFriendsList?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10">
          <div className="relative w-full max-w-sm -rotate-1 rounded-2xl border-2 border-dashed border-[var(--nb-border-color)] bg-muted/50 p-8 text-center">
            <TypingBubble className="absolute -top-4 -left-3 -rotate-6" />
            <TypingBubble tone="primary" className="absolute -right-3 -bottom-4 rotate-6" />
            <span aria-hidden="true" className="mx-auto flex size-14 items-center justify-center rounded-2xl border-2 border-[var(--nb-border-color)] bg-secondary text-on-color shadow-[var(--nb-shadow-sm)]">
              <Users className="size-7" />
            </span>
            <p className="mt-4 text-xl font-extrabold text-foreground">No friends yet</p>
            <p className="mt-1 text-sm font-medium text-muted-foreground">Find people you know and send them a request.</p>
            <Link href="/profile/find-users" className={buttonVariants({ className: "mt-5" })}>
              <Search className="h-4 w-4" aria-hidden="true" />
              Find people
            </Link>
          </div>
        </div>
      ) : visibleFriends.length === 0 ? (
        <p className="py-10 text-center text-sm font-bold text-muted-foreground">Nobody in your friends matches &ldquo;{filter}&rdquo;.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-6 pt-2 sm:grid-cols-2 xl:grid-cols-3">
          {visibleFriends.map((friend: any, index: number) => {
            const last = lastMessages[friend._id];
            const unread = last && last.sender !== user?._id && last?.receiver?.messageStatus === "sent";
            return (
              <PersonCard
                key={friend._id}
                index={index}
                name={friend.username}
                avatarUrl={friend?.avatar?.url}
                stamp={
                  unread ? (
                    <span className="nb-pop inline-block -rotate-6 rounded-md border-2 border-[var(--nb-border-color)] bg-secondary px-1.5 py-0.5 text-[0.65rem] font-extrabold uppercase tracking-wide text-on-color shadow-[2px_2px_0_var(--nb-shadow-color)]">
                      New message
                    </span>
                  ) : undefined
                }
                corner={
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="outline" size="icon-sm" aria-label={`More options for @${friend.username}`} className="bg-card">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => router.push(`/profile/view/${friend._id}`)}>
                        <Eye className="h-4 w-4" />
                        View profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setPendingAction({ type: "remove", friend })}>
                        <UserMinus className="h-4 w-4" />
                        Unfriend
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive" onClick={() => setPendingAction({ type: "block", friend })}>
                        <ShieldAlert className="h-4 w-4" />
                        Block
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                }
              >
                {/* Last message, as a little speech bubble */}
                <Link
                  href={`/links/${friend._id}`}
                  className="group/last mb-3 block text-left"
                  aria-label={last ? `Last message with @${friend.username}: ${last.message || "an image"}` : `Say hi to @${friend.username}`}
                >
                  <span
                    className={cn(
                      "relative block rounded-2xl border-2 px-3 py-2 transition-transform duration-200 group-hover/last:-translate-y-0.5",
                      last ? "border-[var(--nb-line)] bg-muted/60" : "border-dashed border-[var(--nb-line)] bg-card",
                      last && last.sender === user?._id ? "rounded-br-md" : "rounded-bl-md"
                    )}
                  >
                    {last ? (
                      <>
                        <span className="flex items-baseline justify-between gap-2 text-xs font-bold text-muted-foreground">
                          <span>{last.sender === user?._id ? "You" : `@${friend.username}`}</span>
                          <time dateTime={last.updatedAt}>{moment(last.updatedAt).fromNow()}</time>
                        </span>
                        <span className={cn("mt-0.5 block truncate text-sm", unread ? "font-extrabold text-foreground" : "font-semibold text-foreground/85")}>
                          {last.message || "Sent an image"}
                        </span>
                      </>
                    ) : (
                      <span className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                        <MessageSquare className="size-4" aria-hidden="true" />
                        No messages yet. Say hi!
                      </span>
                    )}
                  </span>
                </Link>
                <div className="grid grid-cols-2 gap-2">
                  <Link href={`/links/${friend._id}`} className={cn(buttonVariants({ size: "sm" }), "h-10 min-w-0")}>
                    <MessageSquare className="h-4 w-4" aria-hidden="true" />
                    {last ? "Chat" : "Say hi"}
                  </Link>
                  <Link href={`/mumbles/send/${friend._id}`} className={cn(buttonVariants({ size: "sm" }), "h-10 min-w-0 bg-nb-accent text-on-color")}>
                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                    Mumble
                  </Link>
                </div>
              </PersonCard>
            );
          })}
        </ul>
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
