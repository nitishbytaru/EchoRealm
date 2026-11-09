"use client";

import React, { use, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";
import { Heart, Pin, ChevronLeft, Loader2, MessageSquare, MessageCircle, UserPlus, UserCheck } from "lucide-react";

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
import { Button, buttonVariants } from "@/components/ui/button";
import { getMyFriendsListApi, sendFriendRequestApi } from "@/api/friends.api";
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
  const [relationship, setRelationship] = useState<"none" | "friend" | "requested">("none");
  const isSelf = user?._id === viewProfileUserId;

  useEffect(() => {
    getMyFriendsListApi()
      .then(({ data }) => {
        const isFriend = data?.myFriendList?.friends?.some((f: any) => f._id === viewProfileUserId);
        setRelationship(isFriend ? "friend" : "none");
      })
      .catch((error) => console.error("Error checking friendship:", error));
  }, [viewProfileUserId]);

  const addFriend = async () => {
    try {
      await sendFriendRequestApi(viewProfileUserId);
      setRelationship("requested");
      toast.success("Friend request sent.");
    } catch (error) {
      console.error("Error sending friend request:", error);
      toast.error("That request didn't send. Please try again.");
    }
  };

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
        <p className="text-muted-foreground text-sm">Select a user to view their profile</p>
        <Link href="/profile/find-users" className="mt-4">
          <Button className=" text-xs">
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
        <div className="flex items-center gap-3 pb-4 border-b-[3px] border-[var(--nb-border-color)]">
          <Link href="/profile/find-users" aria-label="Back to Find Users" className="p-2 text-muted-foreground hover:text-foreground rounded-lg transition-colors tap-interactive">
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
              User Profile
            </h2>
            <p className="text-sm text-muted-foreground font-medium mt-1">Likes, friends and pinned Mumbles</p>
          </div>
          <Loader2 className="h-4 w-4 animate-spin text-foreground ml-auto" />
        </div>

        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4 bg-muted/40 border-[3px] border-[var(--nb-border-color)] rounded-2xl p-4 md:p-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-1 flex flex-col items-center">
              <Skeleton className="h-3 w-20 rounded-md" />
              <Skeleton className="h-2 w-28 rounded-md" />
            </div>
          </div>

          {/* Stats card */}
          <div className="flex gap-4 bg-card border p-4 rounded-lg w-full md:w-auto justify-around md:justify-start">
            <div className="space-y-2 px-2 flex flex-col items-center">
              <Skeleton className="h-2.5 w-16 rounded-md" />
              <Skeleton className="h-5 w-8 rounded-md" />
            </div>
            <div className="w-px bg-muted hidden md:block" />
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
              <Card key={i} className="overflow-hidden shadow-[var(--nb-shadow-sm)]">
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
      <div className="flex items-center gap-3 pb-4 border-b-[3px] border-[var(--nb-border-color)]">
        <Link href="/profile/find-users" aria-label="Back to Find Users" className="p-2 text-muted-foreground hover:text-foreground rounded-lg transition-colors tap-interactive">
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
            User Profile
          </h2>
          <p className="text-sm text-muted-foreground font-medium mt-1">Likes, friends and pinned Mumbles</p>
        </div>
        {isPending && <Loader2 className="h-4 w-4 animate-spin text-foreground ml-auto" />}
      </div>

      <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-4 bg-muted/40 border-[3px] border-[var(--nb-border-color)] rounded-2xl p-4 md:p-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <Avatar className="h-16 w-16 border">
            <AvatarImage src={viewingProfileUserDetails?.avatar?.url} />
            <AvatarFallback className="bg-card text-nb-accent-text text-sm border">
              {viewingProfileUserDetails?.username?.slice(0, 2).toUpperCase() || "US"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-sm font-bold text-foreground">@{viewingProfileUserDetails?.username}</h3>
          </div>
        </div>

        {/* Stats card */}
        <div className="flex gap-4 bg-card border p-4 rounded-lg w-full lg:w-auto justify-around lg:justify-start">
          <div className="text-center md:text-left px-2">
            <span className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Total Likes</span>
            <h4 className="text-xl font-black text-foreground mt-0.5">{likes}</h4>
          </div>
          <div className="w-px bg-muted hidden md:block" />
          <div className="text-center md:text-left px-2">
            <span className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Friends</span>
            <h4 className="text-xl font-black text-foreground mt-0.5">{friends}</h4>
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 lg:w-72">
        {splMumble && (
          <Card className="bg-nb-accent/15 border border-[var(--nb-border-color)] w-full rounded-lg">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
              <span className="text-xs font-bold text-nb-accent-text flex items-center gap-1">
                <Pin className="h-3 w-3 rotate-45" />
                Featured Whisper
              </span>
              <div className="flex items-center gap-1 text-nb-danger-text text-xs">
                <Heart className="h-4 w-4 fill-nb-danger" />
                <span>{splMumble?.likeCount || 0} likes</span>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2 text-sm text-foreground leading-relaxed font-medium">
              &ldquo;{splMumble?.message}&rdquo;
            </CardContent>
          </Card>
        )}
          {!isSelf && (
            <div className="flex flex-col gap-2">
              <Link href={`/links/${viewProfileUserId}`} className={buttonVariants({ className: "w-full" })}>
                <MessageSquare className="h-4 w-4" />
                Message
              </Link>
              {relationship !== "friend" && (
                <Button variant="secondary" className="w-full" onClick={addFriend} disabled={relationship === "requested"}>
                  {relationship === "requested" ? <UserCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                  {relationship === "requested" ? "Request sent" : "Add Friend"}
                </Button>
              )}
              <Link href={`/mumbles/send/${viewProfileUserId}`} className={buttonVariants({ variant: "outline", className: "w-full" })}>
                <MessageCircle className="h-4 w-4" />
                Send Mumble
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Featured Mumbles Grid */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Featured Mumbles</h3>

        {viewingProfileUserDetails?.selectedUserProfileMumbles?.length === 0 ? (
          <div className="flex flex-col justify-center items-center text-center p-8 bg-muted/40 border-[3px] border-[var(--nb-border-color)] rounded-2xl min-h-[150px]">
            <p className="text-muted-foreground text-xs">No whispers shared yet by this user</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {viewingProfileUserDetails?.selectedUserProfileMumbles?.map((mumble: any, index: number) => {
              const isLiked = mumble?.likes?.includes(user?._id || "");
              return (
                <Card key={index} className="overflow-hidden relative shadow-[var(--nb-shadow-sm)] card-interactive">
                  <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">@{mumble?.sender?.username || "anonymous"}</span>

                    <button
                      onClick={() => likeThisMumbleFunc(mumble._id)}
                      aria-label={isLiked ? "Remove like" : "Like this Mumble"}
                      aria-pressed={isLiked}
                      disabled={isPending}
                      className="flex size-10 items-center justify-center rounded-full transition-colors"
                    >
                      <Heart className={`h-4 w-4 ${isLiked ? "fill-nb-danger text-nb-danger-text" : "text-muted-foreground hover:text-nb-danger-text"}`} />
                    </button>
                  </CardHeader>
                  <CardContent className="p-4 pt-2 pb-8 text-sm text-foreground leading-relaxed font-medium">
                    {mumble.message}
                  </CardContent>
                  <div className="absolute bottom-2 right-4 flex items-center gap-1 text-xs text-muted-foreground">
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
