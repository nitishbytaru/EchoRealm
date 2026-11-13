"use client";

import React, { useEffect, useState } from "react";
import BusyBadge from "@/components/BusyBadge";
import PageHeader from "@/components/PageHeader";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";
import { UserCheck, UserX2, Eye, UserPlus2, Search, PartyPopper } from "lucide-react";
import PersonCard, { PeopleEmpty, PersonGhosts } from "@/components/people/PersonCard";
import { TypingBubble } from "@/components/brand/BrandMarks";

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
import { Button, buttonVariants } from "@/components/ui/button";
import LoadError from "@/components/LoadError";

export default function MyFriendRequestsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { myFriendRequests } = useSelector((state: RootState) => state.user);

  const [isPending, setIsPending] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [leaving, setLeaving] = useState<Record<string, "accepted" | "declined">>({});

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setIsPending(true);
        setLoadError(false);
        const response = await fetchMyFriendRequestsApi();
        if (response?.data?.requests) {
          dispatch(setMyFriendRequests(response.data.requests));
        }
      } catch (error) {
        console.error("Error fetching friend requests:", error);
        setLoadError(true);
      } finally {
        setIsPending(false);
      }
    };
    fetchRequests();
  }, [dispatch, reloadKey]);

  const handleFriendRequest = async (requestedUserId: string, willAccept: boolean) => {
    try {
      setIsPending(true);
      const response = await handleFriendRequestApi({
        senderId: requestedUserId,
        action: willAccept ? "accept" : "reject",
      });

      if (willAccept) {
        const acceptedUser = myFriendRequests.find((request: any) => request._id === requestedUserId);
        if (acceptedUser) dispatch(addToMyFriendsList(acceptedUser));
      }

      // Let the card celebrate (accept) or drop out (decline) before it leaves the list.
      setLeaving((prev) => ({ ...prev, [requestedUserId]: willAccept ? "accepted" : "declined" }));
      setTimeout(() => {
        dispatch(removeFromMyFriendRequests(requestedUserId));
        setLeaving((prev) => {
          const next = { ...prev };
          delete next[requestedUserId];
          return next;
        });
      }, willAccept ? 1500 : 1100);
      toast.success(response?.data?.message || (willAccept ? "You're friends now." : "Request declined."));
    } catch (error) {
      console.error("Error handling friend request:", error);
      toast.error("Couldn't update that request. Try again.");
    } finally {
      setIsPending(false);
    }
  };

  const viewProfileFunc = (viewProfileUserId: string) => {
    dispatch(setViewingProfileUserDetails(viewProfileUserId));
    router.push(`/profile/view/${viewProfileUserId}`);
  };

  return (
    <div className="nb-stagger space-y-4 [--nb-stagger-start:150ms]">
      <PageHeader
        as="h2"
        title="Friend"
        sticker="requests"
        stickerFill="bg-primary"
        description="People who want to connect with you."
        action={isPending ? <BusyBadge /> : undefined}
        />

      {!loadError && (myFriendRequests?.length ?? 0) > 0 && (
        <span className="w-fit rotate-[-2deg] rounded-lg border-2 border-[var(--nb-border-color)] bg-nb-warning px-2.5 py-1 text-sm font-extrabold text-on-color shadow-[2px_2px_0_var(--nb-shadow-color)]">
          {myFriendRequests.length} waiting
        </span>
      )}

      {loadError ? (
        <LoadError what="your friend requests" onRetry={() => setReloadKey((k) => k + 1)} />
      ) : isPending && (!myFriendRequests || myFriendRequests.length === 0) ? (
        <PersonGhosts label="Loading friend requests" />
      ) : myFriendRequests?.length === 0 ? (
        <PeopleEmpty
          icon={<UserPlus2 className="size-7" />}
          fill="bg-nb-warning"
          title="No requests right now"
          text="When someone wants to be friends, their card shows up here."
          action={
            <Link href="/profile/find-users" className={buttonVariants({})}>
              <Search className="h-4 w-4" aria-hidden="true" />
              Find people
            </Link>
          }
          decor={<TypingBubble className="absolute -top-4 -right-3 rotate-6" tone="primary" />}
        />
      ) : (
        <ul className="grid grid-cols-1 gap-6 pt-2 sm:grid-cols-2 xl:grid-cols-3">
          {myFriendRequests?.map((requestUser: any, index: number) => {
            const state = leaving[requestUser._id];
            return (
              <PersonCard
                key={requestUser._id}
                index={index}
                name={requestUser.username}
                avatarUrl={requestUser?.avatar?.url}
                leaving={state === "declined" ? "decline" : state === "accepted" ? "celebrate" : undefined}
                celebration={
                  <>
                    <span className="flex size-12 items-center justify-center rounded-full border-2 border-[var(--nb-border-color)] bg-card text-foreground">
                      <PartyPopper className="size-6" aria-hidden="true" />
                    </span>
                    <span className="text-xl font-extrabold">Friends now!</span>
                    <span className="text-sm font-bold">You and @{requestUser.username}</span>
                  </>
                }
                stamp={
                  <span className="inline-block -rotate-6 rounded-md border-2 border-[var(--nb-border-color)] bg-nb-warning px-1.5 py-0.5 text-[0.65rem] font-extrabold uppercase tracking-wide text-on-color shadow-[2px_2px_0_var(--nb-shadow-color)]">
                    Wants to be friends
                  </span>
                }
                corner={
                  <Button variant="outline" size="icon-sm" className="bg-card" aria-label={`View @${requestUser.username}'s profile`} title="View profile" onClick={() => viewProfileFunc(requestUser._id)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                }
              >
                <div className="grid grid-cols-2 gap-2">
                  <Button className="h-11 bg-nb-success text-on-color" disabled={Boolean(state)} onClick={() => handleFriendRequest(requestUser._id, true)}>
                    <UserCheck className="h-4 w-4" aria-hidden="true" />
                    Accept
                  </Button>
                  <Button variant="outline" className="h-11" disabled={Boolean(state)} onClick={() => handleFriendRequest(requestUser._id, false)}>
                    <UserX2 className="h-4 w-4" aria-hidden="true" />
                    Decline
                  </Button>
                </div>
              </PersonCard>
            );
          })}
        </ul>
      )}
    </div>
  );
}
