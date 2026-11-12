"use client";

import React, { useEffect, useState } from "react";
import Handle from "@/components/Handle";
import { useSelector } from "react-redux";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  User as UserIcon,
  Pin,
  Users,
  UserPlus2,
  UserX,
  Search,
  Settings,
  Eye,
  Pencil,
  type LucideIcon,
} from "lucide-react";

import { fetchMostLikedMumbleWithLikesAndFriendsApi } from "@/api/user.api";
import { RootState } from "@/store/store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { Sparkle, TypingBubble } from "@/components/brand/BrandMarks";
import { cn } from "@/lib/utils";

interface ProfileLayoutProps {
  children: React.ReactNode;
}

interface Tab {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

export default function ProfileLayout({ children }: ProfileLayoutProps) {
  const pathname = usePathname();
  const { user } = useSelector((state: RootState) => state.auth);
  const { badgeOfPendingRequests } = useSelector((state: RootState) => state.user);
  const [stats, setStats] = useState<{ friends: number; likes: number } | null>(null);

  // Same stats the public profile shows.
  useEffect(() => {
    if (!user?._id) return;
    let cancelled = false;
    fetchMostLikedMumbleWithLikesAndFriendsApi(user._id)
      .then((response) => {
        const data = response?.data?.userRequestedProfileData;
        if (!cancelled && data) setStats({ friends: data.friends || 0, likes: data.profileLikes || 0 });
      })
      .catch((error) => console.error("Error fetching profile stats:", error));
    return () => {
      cancelled = true;
    };
  }, [user?._id]);

  const groups: { label: string; tabs: Tab[] }[] = [
    {
      label: "You",
      tabs: [
        { href: "/profile/edit", label: "Profile", icon: UserIcon },
        { href: "/profile/mumbles", label: "Pinned", icon: Pin },
      ],
    },
    {
      label: "People",
      tabs: [
        { href: "/profile/friends/list", label: "Friends", icon: Users },
        { href: "/profile/friends/requests", label: "Requests", icon: UserPlus2, badge: badgeOfPendingRequests },
        { href: "/profile/find-users", label: "Find people", icon: Search },
        { href: "/profile/blocked-users", label: "Blocked", icon: UserX },
      ],
    },
    {
      label: "Account",
      tabs: [{ href: "/profile/account", label: "Settings", icon: Settings }],
    },
  ];

  const statChips = [
    { label: "friends", value: stats?.friends },
    { label: "likes", value: stats?.likes },
    { label: "requests", value: badgeOfPendingRequests },
  ];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6">
      {/* Member card */}
      <section
        aria-label="Your profile"
        className="relative overflow-hidden rounded-2xl border-[3px] border-[var(--nb-border-color)] bg-card shadow-[var(--nb-shadow)]"
      >
        <div aria-hidden="true" className="h-16 border-b-[3px] border-[var(--nb-border-color)] bg-nb-accent sm:h-20">
          <div className="nb-dotgrid h-full w-full opacity-60 [mask-image:none]" />
        </div>
        <TypingBubble className="absolute top-4 right-5 hidden rotate-3 sm:inline-flex" tone="primary" />
        <Sparkle className="absolute top-3 right-28 hidden w-6 sm:block" />

        <div className="flex flex-col gap-4 px-5 pb-5 sm:flex-row sm:items-end sm:gap-6 sm:px-6">
          <div className="-mt-10 w-fit shrink-0 -rotate-3 rounded-2xl border-[3px] border-[var(--nb-border-color)] bg-card p-1.5 shadow-[var(--nb-shadow-sm)] sm:-mt-12">
            <Avatar className="size-20 rounded-xl sm:size-24 [&>*]:rounded-[0.6rem]">
              <AvatarImage src={user?.avatar?.url} className="object-cover" />
              <AvatarFallback className="rounded-[0.6rem] bg-primary text-2xl font-extrabold text-on-color">
                {user?.username?.slice(0, 2).toUpperCase() || "ME"}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="min-w-0 text-foreground">{user?.username ? <Handle name={user.username} size="xl" className="max-w-full" /> : null}</h1>
            {user?.email && <p className="truncate text-sm font-medium text-muted-foreground">{user.email}</p>}
            <dl className="mt-3 flex flex-wrap gap-2">
              {statChips.map((chip) => (
                <div
                  key={chip.label}
                  className="flex items-baseline gap-1.5 rounded-lg border-[2px] border-[var(--nb-border-color)] bg-muted px-2.5 py-1"
                >
                  <dd className="text-base font-extrabold text-foreground">{chip.value ?? "–"}</dd>
                  <dt className="text-xs font-bold text-muted-foreground">{chip.label}</dt>
                </div>
              ))}
            </dl>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            <Link href="/profile/edit" className={buttonVariants({ variant: "default" })}>
              <Pencil className="h-4 w-4" aria-hidden="true" />
              Edit profile
            </Link>
            {user?._id && (
              <Link href={`/profile/view/${user._id}`} className={buttonVariants({ variant: "outline" })}>
                <Eye className="h-4 w-4" aria-hidden="true" />
                Public view
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Grouped sticker tabs */}
      <nav aria-label="Profile sections" className="-mx-1 overflow-x-auto px-1 pb-2 hide-scrollBar">
        <div className="flex w-max items-end gap-5">
          {groups.map((group) => (
            <div key={group.label} className="flex flex-col gap-1.5">
              <span className="px-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">{group.label}</span>
              <div className="flex gap-2">
                {group.tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = pathname === tab.href;
                  return (
                    <Link
                      key={tab.href}
                      href={tab.href}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "relative flex h-10 items-center gap-2 rounded-xl border-[3px] px-3 text-sm font-bold whitespace-nowrap transition-all tap-interactive",
                        isActive
                          ? "border-[var(--nb-border-color)] bg-primary text-on-color shadow-[var(--nb-shadow-sm)]"
                          : "border-[var(--nb-border-color)] bg-card text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      {tab.label}
                      {tab.badge ? (
                        <span className="rounded-md border-[2px] border-[var(--nb-border-color)] bg-nb-warning px-1.5 text-xs font-extrabold text-on-color">
                          {tab.badge}
                          <span className="sr-only"> pending</span>
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* Section content */}
      <div className="flex-1 rounded-2xl border-[3px] border-[var(--nb-border-color)] bg-card p-5 shadow-[var(--nb-shadow)] sm:p-6 md:p-8">
        <div key={pathname} className="animate-fade-in-up">
          {children}
        </div>
      </div>
    </div>
  );
}
