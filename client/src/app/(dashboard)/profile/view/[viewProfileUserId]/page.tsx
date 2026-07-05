"use client";

import React, { use, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";
import { Heart, Pin, ChevronLeft, Loader2, MessageSquare } from "lucide-react";

import { likeThisMumbleApi } from "@/api/echo_mumble.api";
import {
  getUsersWithMumbles,
  fetchMostLikedMumbleWithLikesAndFriendsApi,
} from "@/api/user.api";
import {
  updateViewingProfileUserDetails,
  setViewingProfileUserDetails,
} from "@/store/slices/user.slice";
import { RootState } from "@/store/store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface PageProps {
  params: Promise<{ viewProfileUserId: string }>;
}

export default function ViewProfilePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { viewProfileUserId } = resolvedParams;
  const dispatch = useDispatch();

  const { user } = useSelector((state: RootState) => state.auth);
  const { viewingProfileUserDetails } = useSelector((state: RootState) => state.user);

  const [likes, setLikes] = useState(0);
  const [friends, setFriends] = useState(0);
  const [splMumble, setSplMumble] = useState<any>(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!viewProfileUserId) return;
      try {
        setIsPending(true);
        const response = await getUsersWithMumbles(viewProfileUserId);
        if (response?.data?.selectedUserProfileDetailsResponse) {
          dispatch(
            setViewingProfileUserDetails(
              response.data.selectedUserProfileDetailsResponse
            )
          );
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast.error("Failed to load profile details.");
      } finally {
        setIsPending(false);
      }
    };

    fetchData();
  }, [dispatch, viewProfileUserId]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!viewProfileUserId) return;
      try {
        setIsPending(true);
        const response = await fetchMostLikedMumbleWithLikesAndFriendsApi(
          viewProfileUserId
        );

        if (response?.data?.userRequestedProfileData) {
          const { mumbleWithHighestLikes, profileLikes, friends: friendsCount } =
            response.data.userRequestedProfileData;

          setSplMumble(mumbleWithHighestLikes);
          setLikes(profileLikes || 0);
          setFriends(friendsCount || 0);
        }
      } catch (error) {
        console.error("Error fetching profile stats:", error);
      } finally {
        setIsPending(false);
      }
    };

    fetchStats();
  }, [dispatch, viewProfileUserId]);

  const likeThisMumbleFunc = async (mumbleId: string) => {
    try {
      setIsPending(true);
      const response = await likeThisMumbleApi(mumbleId);

      if (response?.data?.updatedMumble) {
        dispatch(
          updateViewingProfileUserDetails(response.data.updatedMumble)
        );
        toast.success(response?.data?.message || "Mumble liked!");
      }
    } catch (error) {
      console.error("Error liking mumble:", error);
      toast.error("Failed to like the mumble.");
    } finally {
      setIsPending(false);
    }
  };

  if (!viewProfileUserId) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-64 text-center">
        <p className="text-slate-400 text-sm">Select a user to view their profile</p>
        <Link href="/profile/find-users" className="mt-4">
          <Button className="bg-indigo-500 hover:bg-indigo-600 text-white text-xs">
            Find Users
          </Button>
        </Link>
      </div>
    );
  }
  if (isPending && !viewingProfileUserDetails) {
    return (
      <div className="space-y-4">
        {/* Header with back navigation */}
        <div className="flex items-center gap-3 pb-4 border-b border-zinc-900">
          <Link href="/profile/find-users" className="p-2 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-900 transition-colors tap-interactive">
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-100">
              User Profile
            </h2>
            <p className="text-[10px] text-zinc-555 mt-0.5">View detailed metrics and whispers of this community member</p>
          </div>
          <Loader2 className="h-4 w-4 animate-spin text-indigo-500 ml-auto" />
        </div>

        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4 bg-zinc-900/10 border border-zinc-900 rounded-xl p-4 md:p-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-1 flex flex-col items-center">
              <Skeleton className="h-3 w-20 rounded-md" />
              <Skeleton className="h-2 w-28 rounded-md" />
            </div>
          </div>

          {/* Stats card */}
          <div className="flex gap-4 bg-zinc-950 border border-zinc-900 p-4 rounded-lg w-full md:w-auto justify-around md:justify-start">
            <div className="space-y-2 px-2 flex flex-col items-center">
              <Skeleton className="h-2.5 w-16 rounded-md" />
              <Skeleton className="h-5 w-8 rounded-md" />
            </div>
            <div className="w-px bg-zinc-900 hidden md:block" />
            <div className="space-y-2 px-2 flex flex-col items-center">
              <Skeleton className="h-2.5 w-16 rounded-md" />
              <Skeleton className="h-5 w-8 rounded-md" />
            </div>
          </div>

          <Skeleton className="h-9 w-full md:w-32 rounded-lg" />
        </div>

        {/* Featured Mumbles Grid */}
        <div className="space-y-4">
          <Skeleton className="h-3.5 w-28 rounded-md" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="bg-zinc-900/10 border border-zinc-900 overflow-hidden rounded-xl">
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-3.5 w-20 rounded-md" />
                    <Skeleton className="h-3.5 w-12 rounded-md" />
                  </div>
                  <Skeleton className="h-12 w-full rounded-md" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with back navigation */}
      <div className="flex items-center gap-3 pb-4 border-b border-zinc-900">
        <Link href="/profile/find-users" className="p-2 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-900 transition-colors tap-interactive">
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-100">
            User Profile
          </h2>
          <p className="text-[10px] text-zinc-555 mt-0.5">View detailed metrics and whispers of this community member</p>
        </div>
        {isPending && <Loader2 className="h-4 w-4 animate-spin text-indigo-500 ml-auto" />}
      </div>

      <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4 bg-zinc-900/10 border border-zinc-900 rounded-xl p-4 md:p-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <Avatar className="h-16 w-16 border border-zinc-850">
            <AvatarImage src={viewingProfileUserDetails?.avatar?.url} />
            <AvatarFallback className="bg-zinc-950 text-indigo-400 text-sm border border-zinc-900">
              {viewingProfileUserDetails?.username?.slice(0, 2).toUpperCase() || "US"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-xs font-bold text-zinc-200">@{viewingProfileUserDetails?.username}</h3>
            <p className="text-[9px] text-zinc-500">{viewingProfileUserDetails?.email}</p>
          </div>
        </div>

        {/* Stats card */}
        <div className="flex gap-4 bg-zinc-950 border border-zinc-900 p-4 rounded-lg w-full md:w-auto justify-around md:justify-start">
          <div className="text-center md:text-left px-2">
            <span className="text-[9px] uppercase font-semibold text-zinc-500 tracking-wider">Total Likes</span>
            <h4 className="text-xl font-black text-zinc-100 mt-0.5">{likes}</h4>
          </div>
          <div className="w-px bg-zinc-900 hidden md:block" />
          <div className="text-center md:text-left px-2">
            <span className="text-[9px] uppercase font-semibold text-zinc-500 tracking-wider">Friends</span>
            <h4 className="text-xl font-black text-zinc-100 mt-0.5">{friends}</h4>
          </div>
        </div>

        {/* Send Mumble Button or Special Mumble card */}
        {splMumble ? (
          <Card className="bg-indigo-950/10 border border-indigo-950/30 max-w-sm w-full md:w-80 rounded-lg">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
              <span className="text-[9px] font-bold text-indigo-400 flex items-center gap-1">
                <Pin className="h-3 w-3 rotate-45" />
                Featured Whisper
              </span>
              <div className="flex items-center gap-1 text-rose-500 text-[9px]">
                <Heart className="h-4 w-4 fill-rose-500" />
                <span>{splMumble?.likeCount || 0} likes</span>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2 text-xs text-zinc-350 leading-relaxed font-light">
              &ldquo;{splMumble?.message}&rdquo;
            </CardContent>
          </Card>
        ) : (
          <Link href={`/mumbles/send/${viewProfileUserId}`} className="w-full md:w-auto tap-interactive">
            <Button className="w-full bg-indigo-650 hover:bg-indigo-600 text-zinc-50 text-xs h-9 px-4 rounded-lg flex items-center justify-center gap-2 shadow-sm shadow-indigo-950/20">
              <MessageSquare className="h-4 w-4" />
              Send Mumble
            </Button>
          </Link>
        )}
      </div>

      {/* Featured Mumbles Grid */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Featured Mumbles</h3>

        {viewingProfileUserDetails?.selectedUserProfileMumbles?.length === 0 ? (
          <div className="flex flex-col justify-center items-center text-center p-8 bg-zinc-900/10 border border-zinc-900 rounded-xl min-h-[150px]">
            <p className="text-zinc-500 text-xs">No whispers shared yet by this user</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {viewingProfileUserDetails?.selectedUserProfileMumbles?.map((mumble: any, index: number) => {
              const isLiked = mumble?.likes?.includes(user?._id || "");
              return (
                <Card key={index} className="bg-zinc-900/10 border border-zinc-900 overflow-hidden relative rounded-lg card-interactive">
                  <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                    <span className="text-[10px] font-semibold text-zinc-400">@{mumble?.sender?.username || "anonymous"}</span>

                    <button
                      onClick={() => likeThisMumbleFunc(mumble._id)}
                      disabled={isPending}
                      className="p-1 hover:bg-zinc-900 rounded-full transition-colors tap-interactive"
                    >
                      <Heart className={`h-4 w-4 ${isLiked ? "fill-rose-500 text-rose-500" : "text-zinc-500 hover:text-rose-500"}`} />
                    </button>
                  </CardHeader>
                  <CardContent className="p-4 pt-2 pb-8 text-xs text-zinc-350 leading-relaxed font-light">
                    {mumble.message}
                  </CardContent>
                  <div className="absolute bottom-2 right-4 flex items-center gap-1 text-[9px] text-zinc-500">
                    <span>{mumble?.likes?.length || 0} likes</span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
