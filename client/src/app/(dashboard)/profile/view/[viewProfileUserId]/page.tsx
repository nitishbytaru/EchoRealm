"use client";

import React, { use, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { toast } from "sonner";
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

  return (
    <div className="space-y-6">
      {/* Header with back navigation */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-900">
        <Link href="/profile/find-users" className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-900 transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            User Profile
          </h2>
          <p className="text-xs text-slate-500">View detailed metrics and whispers of this community member</p>
        </div>
        {isPending && <Loader2 className="h-5 w-5 animate-spin text-indigo-550 ml-auto" />}
      </div>

      <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 bg-slate-950/20 border border-slate-900/60 rounded-3xl p-5 md:p-6">
        <div className="flex flex-col items-center text-center space-y-3">
          <Avatar className="h-20 w-20 sm:h-28 sm:w-28 border border-slate-800">
            <AvatarImage src={viewingProfileUserDetails?.avatar?.url} />
            <AvatarFallback className="bg-indigo-950 text-indigo-400 text-xl">
              {viewingProfileUserDetails?.username?.slice(0, 2).toUpperCase() || "US"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-sm font-bold text-white">@{viewingProfileUserDetails?.username}</h3>
            <p className="text-[10px] text-slate-500">{viewingProfileUserDetails?.email}</p>
          </div>
        </div>

        {/* Stats card */}
        <div className="flex gap-6 bg-slate-900/30 border border-slate-900/50 p-4 rounded-2xl w-full md:w-auto justify-around md:justify-start">
          <div className="text-center md:text-left px-3">
            <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Total Likes</span>
            <h4 className="text-2xl font-black text-white mt-1">{likes}</h4>
          </div>
          <div className="w-px bg-slate-900 hidden md:block" />
          <div className="text-center md:text-left px-3">
            <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Friends</span>
            <h4 className="text-2xl font-black text-white mt-1">{friends}</h4>
          </div>
        </div>

        {/* Send Mumble Button or Special Mumble card */}
        {splMumble ? (
          <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-indigo-500/20 max-w-sm w-full md:w-80">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
              <span className="text-[10px] font-bold text-indigo-400 flex items-center gap-1">
                <Pin className="h-3 w-3 rotate-45" />
                Featured Whisper
              </span>
              <div className="flex items-center gap-1 text-rose-500 text-[10px]">
                <Heart className="h-3.5 w-3.5 fill-rose-500" />
                <span>{splMumble?.likeCount || 0} likes</span>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-1 text-xs text-slate-350 leading-relaxed font-light">
              &ldquo;{splMumble?.message}&rdquo;
            </CardContent>
          </Card>
        ) : (
          <Link href={`/mumbles/send/${viewProfileUserId}`} className="w-full md:w-auto">
            <Button className="w-full bg-indigo-500 hover:bg-indigo-600 text-white text-xs h-10 px-4 rounded-xl flex items-center justify-center gap-1.5">
              <MessageSquare className="h-4 w-4" />
              Send Mumble
            </Button>
          </Link>
        )}
      </div>

      {/* Featured Mumbles Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-300">Featured Mumbles</h3>

        {viewingProfileUserDetails?.selectedUserProfileMumbles?.length === 0 ? (
          <div className="flex flex-col justify-center items-center text-center p-8 bg-slate-950/20 border border-slate-900 rounded-3xl min-h-[150px]">
            <p className="text-slate-500 text-xs">No whispers shared yet by this user</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {viewingProfileUserDetails?.selectedUserProfileMumbles?.map((mumble: any, index: number) => {
              const isLiked = mumble?.likes?.includes(user?._id || "");
              return (
                <Card key={index} className="bg-slate-900/20 border border-slate-900 overflow-hidden relative">
                  <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                    <span className="text-[10px] font-semibold text-slate-400">@{mumble?.sender?.username || "anonymous"}</span>

                    <button
                      onClick={() => likeThisMumbleFunc(mumble._id)}
                      disabled={isPending}
                      className="p-1 hover:bg-slate-905 rounded-full transition-colors"
                    >
                      <Heart className={`h-4 w-4 ${isLiked ? "fill-rose-500 text-rose-500" : "text-slate-500 hover:text-rose-500"}`} />
                    </button>
                  </CardHeader>
                  <CardContent className="p-4 pt-1 pb-8 text-xs text-slate-300 leading-relaxed font-light">
                    {mumble.message}
                  </CardContent>
                  <div className="absolute bottom-3 right-4 flex items-center gap-1 text-[10px] text-slate-500">
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
