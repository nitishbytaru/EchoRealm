"use client";

import React, { useEffect, useState } from "react";
import BusyBadge from "@/components/BusyBadge";
import PageHeader from "@/components/PageHeader";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "@/hooks/use-toast";
import { ShieldCheck, ShieldOff } from "lucide-react";
import PersonCard, { PeopleEmpty, PersonGhosts } from "@/components/people/PersonCard";

import { getBlockedUsersApi, unBlockUserApi } from "@/api/friends.api";
import { setBlockedUsers, removeFromBlockedUsers } from "@/store/slices/user.slice";
import { RootState } from "@/store/store";
import { Button } from "@/components/ui/button";
import LoadError from "@/components/LoadError";

export default function BlockedUsersPage() {
  const dispatch = useDispatch();
  const { blockedUsers } = useSelector((state: RootState) => state.user);
  const [isPending, setIsPending] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [unblocking, setUnblocking] = useState<string | null>(null);

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
      toast.success(response?.data?.message || "Unblocked.");
      // Let the card drop out of the grid before it's removed.
      setUnblocking(userId);
      setTimeout(() => {
        dispatch(removeFromBlockedUsers(userId));
        setUnblocking(null);
      }, 450);
    } catch (error) {
      console.error("Error unblocking user:", error);
      toast.error("Failed to unblock the user.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="nb-stagger space-y-4 [--nb-stagger-start:150ms]">
      <PageHeader
        as="h2"
        title="Blocked"
        sticker="people"
        stickerFill="bg-primary"
        description="They can't message you, Mumble you or find you in search."
        action={isPending ? <BusyBadge /> : undefined}
        />

      {loadError ? (
        <LoadError what="your blocked users" onRetry={() => setReloadKey((k) => k + 1)} />
      ) : isPending && (!blockedUsers || blockedUsers.length === 0) ? (
        <PersonGhosts label="Loading blocked users" />
      ) : blockedUsers?.length === 0 ? (
        <PeopleEmpty
          icon={<ShieldCheck className="size-7" />}
          fill="bg-nb-success"
          title="Nobody's blocked"
          text="If you block someone, they'll show up here and you can unblock them anytime."
        />
      ) : (
        <ul className="grid grid-cols-1 gap-6 pt-2 sm:grid-cols-2 xl:grid-cols-3">
          {blockedUsers?.map((blockedUser: any, index: number) => (
            <PersonCard
              key={blockedUser._id}
              index={index}
              variant="blocked"
              name={blockedUser.username}
              avatarUrl={blockedUser?.avatar?.url}
              leaving={unblocking === blockedUser._id ? "out" : undefined}
              stamp={
                <span className="inline-block -rotate-6 rounded-md border-2 border-[var(--nb-border-color)] bg-destructive px-1.5 py-0.5 text-[0.65rem] font-extrabold uppercase tracking-wide text-on-color shadow-[2px_2px_0_var(--nb-shadow-color)]">
                  Blocked
                </span>
              }
              subtitle="Can't message, Mumble or find you"
            >
              <Button variant="outline" className="h-11 w-full" disabled={unblocking === blockedUser._id} onClick={() => unBlockUser(blockedUser._id)}>
                <ShieldOff className="h-4 w-4" aria-hidden="true" />
                Unblock
              </Button>
            </PersonCard>
          ))}
        </ul>
      )}
    </div>
  );
}
