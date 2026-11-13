"use client";

import React, { use, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";
import { Heart, ChevronLeft, MessageSquare, MessageCircle, UserPlus, UserCheck, Send, Pencil, Eye } from "lucide-react";
import MumbleNote from "@/app/(dashboard)/mumbles/components/MumbleNote";
import Loading from "@/components/Loading";
import CountUp from "@/components/CountUp";
import { PeopleEmpty } from "@/components/people/PersonCard";
import { Sparkle, TypingBubble } from "@/components/brand/BrandMarks";
import { chipColor } from "@/lib/chipColor";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

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
import { Button, buttonVariants } from "@/components/ui/button";
import { getMyFriendsListApi, sendFriendRequestApi } from "@/api/friends.api";

interface PageProps {
  params: Promise<{ viewProfileUserId: string }>;
}

export default function ViewProfilePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { viewProfileUserId } = resolvedParams;
  const dispatch = useDispatch();

  const { user } = useSelector((state: RootState) => state.auth);
  const { viewingProfileUserDetails } = useSelector((state: RootState) => state.user);

  const [likes, setLikes] = useState<number | undefined>(undefined);
  const [friends, setFriends] = useState<number | undefined>(undefined);
  const [likingId, setLikingId] = useState<string | null>(null);
  const [splMumble, setSplMumble] = useState<any>(null);
  const [isPending, setIsPending] = useState(false);
  const [relationship, setRelationship] = useState<"none" | "friend" | "requested">("none");
  const isSelf = user?._id === viewProfileUserId;
  const router = useRouter();

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
      setLikingId(mumbleId);
      const response = await likeThisMumbleApi(mumbleId);

      if (response?.data?.updatedMumble) {
        dispatch(
          updateViewingProfileUserDetails(response.data.updatedMumble)
        );
      }
    } catch (error) {
      console.error("Error liking mumble:", error);
      toast.error("Couldn't update that like. Try again.");
    } finally {
      setLikingId(null);
    }
  };

  if (!viewProfileUserId) {
    return (
      <PeopleEmpty
        icon={<Eye className="size-7" />}
        title="Nobody selected"
        text="Pick someone from Find people to see their profile."
        action={<Link href="/profile/find-users" className={buttonVariants({})}>Find people</Link>}
      />
    );
  }

  const person = viewingProfileUserDetails;
  if (!person || (isPending && person?._id && person._id !== viewProfileUserId)) {
    return <Loading label="Opening profile" />;
  }

  const name: string = person?.username ?? "";
  const pinned: any[] = person?.selectedUserProfileMumbles ?? [];
  const relationStamp = isSelf
    ? { text: "This is you", fill: "bg-primary", Icon: Eye }
    : relationship === "friend"
    ? { text: "Friends", fill: "bg-nb-success", Icon: UserCheck }
    : relationship === "requested"
    ? { text: "Request sent", fill: "bg-nb-warning", Icon: Send }
    : null;

  const LikeButton = ({ mumble }: { mumble: any }) => {
    const isLiked = mumble?.likes?.includes(user?._id || "");
    return (
      <button
        type="button"
        onClick={() => likeThisMumbleFunc(mumble._id)}
        aria-label={isLiked ? "Remove like" : "Like this Mumble"}
        aria-pressed={isLiked}
        disabled={likingId === mumble._id}
        className={cn(
          "flex size-9 items-center justify-center rounded-full border-2 transition-colors",
          isLiked ? "border-[var(--nb-border-color)] bg-destructive text-on-color" : "border-transparent hover:border-[var(--nb-border-color)] hover:bg-card"
        )}
      >
        <Heart key={String(isLiked)} className={cn("nb-pop h-4 w-4", isLiked && "fill-current")} aria-hidden="true" />
      </button>
    );
  };

  return (
    <div className="nb-stagger flex flex-col gap-8 [--nb-stagger-start:80ms]">
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex w-fit items-center gap-1.5 rounded-xl px-2 py-1.5 text-sm font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Back
      </button>

      {isSelf && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-dashed border-[var(--nb-border-color)] bg-muted/60 px-4 py-3">
          <p className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Eye className="h-4 w-4" aria-hidden="true" />
            This is how other people see your profile.
          </p>
          <Link href="/profile/edit" className={buttonVariants({ size: "sm", variant: "outline" })}>
            <Pencil className="h-4 w-4" aria-hidden="true" />
            Edit profile
          </Link>
        </div>
      )}

      {/* Hero: their ID badge */}
      <section aria-label={`@${name}'s profile`} className="nb-sticker-in relative grid overflow-hidden rounded-2xl border-2 border-[var(--nb-border-color)] bg-card shadow-[var(--nb-shadow)] sm:grid-cols-[14rem_minmax(0,1fr)] lg:grid-cols-[17rem_minmax(0,1fr)]">
        <div className={cn("relative flex items-center justify-center overflow-hidden border-b-2 border-[var(--nb-line)] py-7 sm:border-r-2 sm:border-b-0", chipColor(name))}>
          <div aria-hidden="true" className="nb-dotgrid absolute inset-0 opacity-70 [mask-image:none]" />
          <Sparkle className="absolute top-4 left-4 w-6" />
          <Sparkle className="absolute right-5 bottom-5 w-4" style={{ animationDelay: "1s" }} />
          <TypingBubble className="absolute top-4 right-3 scale-75 rotate-6" tone="primary" />
          <div className="relative rotate-[-4deg] rounded-xl border-2 border-[var(--nb-border-color)] bg-card p-2.5 pb-3 shadow-[var(--nb-shadow)] transition-transform duration-300 hover:rotate-0">
            <Avatar className="size-32 rounded-lg border-2 shadow-none lg:size-36 [&>*]:rounded-[0.4rem]">
              <AvatarImage src={person?.avatar?.url} className="object-cover" />
              <AvatarFallback className="rounded-[0.4rem] bg-muted text-4xl font-extrabold text-foreground">{name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <p className="mt-2 text-center text-sm font-extrabold text-foreground"><span className="opacity-55">@</span>{name}</p>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-5 p-5 sm:p-6">
          <div className="min-w-0">
            {relationStamp && (
              <span key={relationStamp.text} className={cn("nb-pop mb-3 inline-flex -rotate-3 items-center gap-1.5 rounded-md border-2 border-[var(--nb-border-color)] px-2 py-0.5 text-xs font-extrabold uppercase tracking-wide text-on-color shadow-[2px_2px_0_var(--nb-shadow-color)]", relationStamp.fill)}>
                <relationStamp.Icon className="size-3.5" aria-hidden="true" />
                {relationStamp.text}
              </span>
            )}
            <h1 className="truncate text-4xl leading-none font-extrabold tracking-tight text-foreground sm:text-5xl">{name}</h1>
          </div>

          <dl className="grid max-w-sm grid-cols-2 gap-3">
            {[
              { label: "Friends", value: friends, Icon: UserCheck, fill: "bg-secondary", tilt: "-rotate-1" },
              { label: "Likes", value: likes, Icon: Heart, fill: "bg-destructive", tilt: "rotate-1" },
            ].map((tile, i) => (
              <div
                key={tile.label}
                className={cn("nb-stat-in flex items-center gap-2.5 rounded-2xl border-2 border-[var(--nb-border-color)] bg-card p-3 shadow-[2px_2px_0_var(--nb-shadow-color)]", tile.tilt)}
                style={{ animationDelay: `${0.2 + i * 0.08}s` }}
              >
                <span aria-hidden="true" className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl border-2 border-[var(--nb-border-color)] text-on-color", tile.fill)}>
                  <tile.Icon className="size-4" />
                </span>
                <span>
                  <dd className="text-2xl leading-none font-extrabold text-foreground">
                    {tile.value === undefined ? (
                      <span className="inline-flex h-6 items-center gap-1" aria-label="Loading">
                        <span className="auth-dot !size-1.5 !bg-[var(--nb-border-color)]" />
                        <span className="auth-dot !size-1.5 !bg-[var(--nb-border-color)]" />
                        <span className="auth-dot !size-1.5 !bg-[var(--nb-border-color)]" />
                      </span>
                    ) : (
                      <CountUp value={tile.value} />
                    )}
                  </dd>
                  <dt className="mt-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">{tile.label}</dt>
                </span>
              </div>
            ))}
          </dl>

          {!isSelf && (
            <div className="flex flex-wrap gap-2">
              <Link href={`/links/${viewProfileUserId}`} className={buttonVariants({})}>
                <MessageSquare className="h-4 w-4" aria-hidden="true" />
                Message
              </Link>
              <Link href={`/mumbles/send/${viewProfileUserId}`} className={cn(buttonVariants({}), "bg-nb-accent text-on-color")}>
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Send a Mumble
              </Link>
              {relationship === "none" && (
                <Button className="bg-secondary text-on-color" onClick={addFriend}>
                  <UserPlus className="h-4 w-4" aria-hidden="true" />
                  Add friend
                </Button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Most loved Mumble */}
      {splMumble?.message && (
        <section aria-labelledby="loved-heading" className="space-y-4">
          <h2 id="loved-heading" className="text-2xl font-extrabold tracking-tight text-foreground">
            Most <span className="nb-sticker-word bg-destructive">loved</span>
          </h2>
          <div className="relative max-w-xl">
            <span aria-hidden="true" className="nb-pop absolute -top-4 -right-1 z-10 flex size-12 rotate-12 sm:-right-3 items-center justify-center rounded-full border-2 border-[var(--nb-border-color)] bg-destructive text-on-color shadow-[var(--nb-shadow-sm)]">
              <Heart className="size-6 fill-current" />
            </span>
            <MumbleNote
              index={1}
              isPinned
              message={splMumble.message}
              sender={splMumble?.sender?.senderId ? splMumble?.sender?.username : null}
              time={splMumble?.createdAt}
              likes={splMumble?.likeCount ?? splMumble?.likes?.length ?? 0}
            />
          </div>
        </section>
      )}

      {/* Pinned Mumbles */}
      <section aria-labelledby="pinned-heading" className="space-y-4">
        <div>
          <h2 id="pinned-heading" className="text-2xl font-extrabold tracking-tight text-foreground">
            Pinned <span className="nb-sticker-word bg-nb-accent">Mumbles</span>
          </h2>
          <p className="mt-1 text-sm font-medium text-muted-foreground">Notes {isSelf ? "you've" : `@${name} has`} chosen to show on {isSelf ? "your" : "their"} profile.</p>
        </div>
        {pinned.length === 0 ? (
          <PeopleEmpty
            icon={<MessageCircle className="size-7" />}
            fill="bg-nb-accent"
            title="Nothing pinned yet"
            text={isSelf ? "Pin Mumbles from your inbox to show them here." : `@${name} hasn't pinned any Mumbles yet.`}
          />
        ) : (
          <ul className="grid grid-cols-1 gap-6 pt-3 sm:grid-cols-2 lg:grid-cols-3">
            {pinned.map((mumble: any, index: number) => (
              <li key={mumble._id || index} className="nb-friend-in" style={{ ["--tilt" as string]: "0deg", animationDelay: `${0.3 + Math.min(index, 6) * 0.07}s` }}>
                <MumbleNote
                  index={index}
                  isPinned
                  message={mumble?.message}
                  sender={mumble?.sender?.senderId ? mumble?.sender?.username : null}
                  time={mumble?.createdAt}
                  likes={mumble?.likes?.length || 0}
                  action={<LikeButton mumble={mumble} />}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
