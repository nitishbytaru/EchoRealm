"use client";

import React, { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import Link from "next/link";
import MumbleNote from "@/app/(dashboard)/mumbles/components/MumbleNote";
import { Sparkle } from "@/components/brand/BrandMarks";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "@/hooks/use-toast";
import { Heart, Pin, MoreVertical, Loader2 } from "lucide-react";

import { getMumblesApi, pinMumbleApi } from "@/api/echo_mumble.api";
import {
  setPinnedMumbles,
  updateMumbles,
  removePinnedMumble,
} from "@/store/slices/echo_mumble.slice";
import { RootState } from "@/store/store";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function MyMumblesPage() {
  const dispatch = useDispatch();
  const { pinnedMumblesInMyProfile } = useSelector((state: RootState) => state.echoMumble);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    const fetchPinnedMumbles = async () => {
      try {
        setIsPending(true);
        const response = await getMumblesApi();
        const pinned = response?.data?.mumbles?.filter(
          (mumble: any) => mumble?.pinned === true
        );
        dispatch(setPinnedMumbles(pinned || []));
      } catch (error) {
        console.error("Error fetching pinned mumbles:", error);
        toast.error("Failed to load pinned mumbles.");
      } finally {
        setIsPending(false);
      }
    };
    fetchPinnedMumbles();
  }, [dispatch]);

  const unpinMumble = async (mumbleId: string) => {
    try {
      setIsPending(true);
      const response = await pinMumbleApi(mumbleId);
      if (response?.data) {
        const { updatedMumble, message } = response.data;
        dispatch(updateMumbles(updatedMumble));
        dispatch(removePinnedMumble(updatedMumble?._id));
        toast.success(message || "Unpinned successfully!");
      }
    } catch (error) {
      console.error("Error unpinning mumble:", error);
      toast.error("Failed to unpin the mumble.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        as="h2"
        title="Pinned"
        sticker="Mumbles"
        stickerFill="bg-primary"
        description="Up to 4 notes from your inbox, shown on your public profile."
        action={isPending ? <Loader2 className="h-5 w-5 animate-spin text-foreground" aria-label="Loading" /> : undefined}
        />

      {isPending && (!pinnedMumblesInMyProfile || pinnedMumblesInMyProfile.length === 0) ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="overflow-hidden shadow-[var(--nb-shadow-sm)]">
              <CardContent className="p-4 space-y-3 pt-6">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-3.5 w-20 rounded-md" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                </div>
                <Skeleton className="h-12 w-full rounded-md" />
                <div className="flex justify-end pt-2">
                  <Skeleton className="h-3 w-16 rounded-md" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : pinnedMumblesInMyProfile?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="relative w-full max-w-sm -rotate-1 rounded-2xl border-[3px] border-dashed border-[var(--nb-border-color)] bg-muted/50 p-8 text-center">
            <Sparkle className="absolute -top-3 -right-3 w-8" />
            <p className="text-xl font-extrabold text-foreground">Nothing pinned yet</p>
            <p className="mt-2 text-sm font-medium text-muted-foreground">
              Open a note in your Mumble inbox and choose Pin to profile.
            </p>
            <Link href="/mumbles/read" className={buttonVariants({ className: "mt-5 bg-nb-accent text-on-color" })}>
              Open inbox
            </Link>
          </div>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-6 pt-3 sm:grid-cols-2 lg:grid-cols-3">
          {pinnedMumblesInMyProfile?.map((mumble: any, index: number) => {
            const likes = mumble?.likes?.length || 0;
            return (
              <li key={mumble._id}>
                <MumbleNote
                  index={index}
                  isPinned
                  message={mumble?.message}
                  sender={mumble?.sender?.username || null}
                  action={
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon-sm" aria-label="Mumble options">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={() => unpinMumble(mumble._id)}>
                          <Pin className="h-4 w-4" />
                          Unpin Mumble
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  }
                  footer={
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground">
                      <Heart className={`h-4 w-4 ${likes > 0 ? "fill-nb-danger text-nb-danger-text" : ""}`} aria-hidden="true" />
                      {likes} {likes === 1 ? "like" : "likes"}
                    </span>
                  }
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
