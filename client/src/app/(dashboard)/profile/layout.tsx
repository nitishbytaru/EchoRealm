"use client";

import React, { useEffect, useRef, useState } from "react";
import CountUp from "@/components/CountUp";
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
  LogOut,
  Mail,
  Heart,
  HatGlasses,
  MessageCircle,
  type LucideIcon,
} from "lucide-react";

import { fetchMostLikedMumbleWithLikesAndFriendsApi } from "@/api/user.api";
import { RootState } from "@/store/store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { useLogout } from "@/hooks/useLogout";
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
  const { logout, isLoggingOut } = useLogout();
  const { user } = useSelector((state: RootState) => state.auth);
  const { badgeOfPendingRequests } = useSelector((state: RootState) => state.user);
  const [stats, setStats] = useState<{ friends: number; likes: number } | null>(null);
  const tabsRef = useRef<HTMLElement | null>(null);
  const prevTabPath = useRef<string | null>(null);

  // On narrow screens the tab row scrolls sideways; keep the active tab in view.
  // Tab widths settle after fonts load and the entrance animation runs, so re-center
  // whenever the row resizes, until the person scrolls it themselves.
  useEffect(() => {
    const nav = tabsRef.current;
    if (!nav) return;
    let userScrolled = false;
    const center = (smooth: boolean) => {
      const active = nav.querySelector<HTMLElement>('[aria-current="page"]');
      if (!active || userScrolled) return;
      // Measure on screen: while the tab groups animate in, offsetLeft is taken from the group, not the row.
      const navBox = nav.getBoundingClientRect();
      const tabBox = active.getBoundingClientRect();
      const target = nav.scrollLeft + (tabBox.left - navBox.left) - (navBox.width - tabBox.width) / 2;
      nav.scrollTo({ left: Math.max(0, target), behavior: smooth ? "smooth" : "auto" });
    };
    // Glide only when switching tabs; jump on first load (dev StrictMode runs this twice, so compare paths).
    center(prevTabPath.current !== null && prevTabPath.current !== pathname);
    prevTabPath.current = pathname;
    const row = nav.firstElementChild;
    const observer = new ResizeObserver(() => center(false));
    if (row) observer.observe(row);
    observer.observe(nav);
    const stop = () => {
      userScrolled = true;
    };
    nav.addEventListener("pointerdown", stop);
    nav.addEventListener("wheel", stop, { passive: true });
    nav.addEventListener("touchstart", stop, { passive: true });
    return () => {
      observer.disconnect();
      nav.removeEventListener("pointerdown", stop);
      nav.removeEventListener("wheel", stop);
      nav.removeEventListener("touchstart", stop);
    };
  }, [pathname]);

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

  const groups: { label: string; fill: string; tabs: Tab[] }[] = [
    {
      label: "You",
      fill: "bg-primary",
      tabs: [
        { href: "/profile/edit", label: "Profile", icon: UserIcon },
        { href: "/profile/mumbles", label: "Pinned", icon: Pin },
      ],
    },
    {
      label: "People",
      fill: "bg-secondary",
      tabs: [
        { href: "/profile/friends/list", label: "Friends", icon: Users },
        { href: "/profile/friends/requests", label: "Requests", icon: UserPlus2, badge: badgeOfPendingRequests },
        { href: "/profile/find-users", label: "Find people", icon: Search },
        { href: "/profile/blocked-users", label: "Blocked", icon: UserX },
      ],
    },
    {
      label: "Account",
      fill: "bg-nb-accent",
      tabs: [{ href: "/profile/account", label: "Settings", icon: Settings }],
    },
  ];

  // Which way the content slides when switching tabs: from the right when moving right along the row.
  const tabOrder = groups.flatMap((g) => g.tabs.map((t) => t.href));
  const tabIndex = tabOrder.indexOf(pathname);
  const [lastTab, setLastTab] = useState({ path: pathname, index: tabIndex, dir: 0 });
  if (lastTab.path !== pathname) {
    // Adjusting state while rendering (React's pattern for reacting to a changed value).
    setLastTab({ path: pathname, index: tabIndex, dir: tabIndex >= lastTab.index ? 1 : -1 });
  }
  const tabDirection = lastTab.dir;

  const statTiles: { label: string; value?: number; icon: LucideIcon; fill: string; tilt: string; href?: string }[] = [
    { label: "Friends", value: stats?.friends, icon: Users, fill: "bg-secondary", tilt: "-rotate-1", href: "/profile/friends/list" },
    { label: "Likes", value: stats?.likes, icon: Heart, fill: "bg-destructive", tilt: "rotate-1" },
    { label: "Requests", value: stats ? badgeOfPendingRequests : undefined, icon: UserPlus2, fill: "bg-nb-warning", tilt: "-rotate-[0.5deg]", href: "/profile/friends/requests" },
  ];
  // Someone's public profile gets the whole page, without your own card and tabs above it.
  if (pathname.startsWith("/profile/view")) {
    return <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col">{children}</div>;
  }

  return (
    <div className="nb-stagger mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6">
      {/* Member card: only on the Profile tab */}
      {pathname === "/profile/edit" && (
        <section
          aria-label="Your profile"
          className="nb-sticker-in relative grid overflow-hidden rounded-2xl border-2 border-[var(--nb-border-color)] bg-card shadow-[var(--nb-shadow)] sm:grid-cols-[13rem_minmax(0,1fr)] lg:grid-cols-[15rem_minmax(0,1fr)]"
        >
          {/* Photo panel */}
          <div className="relative flex items-center justify-center overflow-hidden border-b-2 border-[var(--nb-line)] bg-nb-accent py-5 sm:border-r-2 sm:border-b-0 sm:py-8">
            <div aria-hidden="true" className="nb-dotgrid absolute inset-0 opacity-70 [mask-image:none]" />
            <Sparkle className="absolute top-4 left-4 w-6" />
            <Sparkle className="absolute right-5 bottom-5 w-4" style={{ animationDelay: "1s" }} />
            <TypingBubble className="absolute top-4 right-3 scale-75 rotate-6" tone="primary" />
            <div className="nb-profile-photo relative rotate-[-4deg] rounded-[1.4rem] border-2 border-[var(--nb-border-color)] bg-card p-2 shadow-[var(--nb-shadow)] transition-transform duration-300 hover:rotate-0">
              <Avatar className="size-24 rounded-2xl border-0 shadow-none sm:size-28 lg:size-32 [&>*]:rounded-[0.9rem]">
                <AvatarImage src={user?.avatar?.url} className="object-cover" />
                <AvatarFallback className="rounded-[0.9rem] bg-primary text-3xl font-extrabold text-on-color">
                  {user?.username?.slice(0, 2).toUpperCase() || "ME"}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
  
          {/* Details */}
          <div className="flex min-w-0 flex-col gap-5 p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="min-w-0 text-4xl leading-none font-extrabold tracking-tight text-foreground sm:text-5xl">
                  <span className="block truncate">{user?.username ?? ""}</span>
                </h1>
                <span className="sr-only">@{user?.username}</span>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {user?.email && (
                    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border-2 border-[var(--nb-line)] bg-muted px-3 py-1 text-sm font-semibold text-muted-foreground">
                      <Mail className="size-3.5 shrink-0" aria-hidden="true" />
                      <span className="truncate">{user.email}</span>
                    </span>
                  )}
                  <span className={cn("inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1 text-sm font-bold", user?.isAnonymous ? "border-[var(--nb-border-color)] bg-nb-accent text-on-color" : "border-[var(--nb-line)] bg-card text-muted-foreground")}>
                    {user?.isAnonymous ? <HatGlasses className="size-3.5" aria-hidden="true" /> : <UserIcon className="size-3.5" aria-hidden="true" />}
                    {user?.isAnonymous ? "Posting anonymously" : "Posting as you"}
                  </span>
                  <span className={cn("inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1 text-sm font-bold", user?.isAcceptingMumbles ? "border-[var(--nb-border-color)] bg-nb-success text-on-color" : "border-[var(--nb-line)] bg-card text-muted-foreground")}>
                    <MessageCircle className="size-3.5" aria-hidden="true" />
                    {user?.isAcceptingMumbles ? "Open to Mumbles" : "Mumbles off"}
                  </span>
                </div>
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
                <Button variant="ghost" onClick={logout} loading={isLoggingOut} className="text-muted-foreground hover:text-foreground">
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Log out
                </Button>
              </div>
            </div>
  
            {/* Stats */}
            <dl className="grid grid-cols-3 gap-3 sm:max-w-lg">
              {statTiles.map((tile, i) => {
                const Icon = tile.icon;
                const body = (
                  <>
                    <span aria-hidden="true" className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl border-2 border-[var(--nb-border-color)] text-on-color transition-transform duration-200 group-hover/stat:-rotate-12", tile.fill)}>
                      <Icon className="size-4.5" />
                    </span>
                    <span className="min-w-0">
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
                      <dt className="mt-1 truncate text-xs font-bold uppercase tracking-wide text-muted-foreground">{tile.label}</dt>
                    </span>
                  </>
                );
                const cls = cn(
                  "nb-stat-in group/stat flex flex-col items-start gap-2 rounded-2xl border-2 border-[var(--nb-border-color)] bg-card p-3 shadow-[2px_2px_0_var(--nb-shadow-color)] sm:flex-row sm:items-center sm:gap-2.5 transition-[rotate,translate,box-shadow] duration-200 hover:-translate-y-1 hover:rotate-0 hover:shadow-[var(--nb-shadow-sm)]",
                  tile.tilt
                );
                return tile.href ? (
                  <Link key={tile.label} href={tile.href} className={cls} style={{ animationDelay: `${0.2 + i * 0.08}s` }}>
                    {body}
                  </Link>
                ) : (
                  <div key={tile.label} className={cls} style={{ animationDelay: `${0.2 + i * 0.08}s` }}>
                    {body}
                  </div>
                );
              })}
            </dl>
          </div>
        </section>
      )}

      {/* Binder: tabs sit on the content panel; the active one joins it */}
      <div className="flex flex-1 flex-col">
        <nav ref={tabsRef} aria-label="Profile sections" className="relative z-10 -mb-[2px] overflow-x-auto hide-scrollBar">
          <div className="nb-stagger flex w-max items-end gap-5 px-5 pt-2 [--nb-stagger-start:120ms]">
            {groups.map((group) => (
              <div key={group.label} role="group" aria-label={group.label} className="flex items-end gap-1.5">
                <span
                  aria-hidden="true"
                  className={cn(
                    "mr-1 mb-3 -rotate-6 rounded-md border-2 border-[var(--nb-border-color)] px-1.5 py-0.5 text-[0.65rem] font-extrabold uppercase tracking-wide text-on-color shadow-[2px_2px_0_var(--nb-shadow-color)]",
                    group.fill
                  )}
                >
                  {group.label}
                </span>
                {group.tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = pathname === tab.href;
                  return (
                    <Link
                      key={tab.href}
                      href={tab.href}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "relative flex items-center gap-2 rounded-t-xl border-2 border-b-0 px-3.5 text-sm font-bold whitespace-nowrap transition-[height,background-color,color] duration-200",
                        isActive
                          ? "h-12 border-[var(--nb-border-color)] bg-card pt-1 text-foreground"
                          : "mb-[2px] h-10 border-[var(--nb-line)] bg-muted text-muted-foreground hover:h-11 hover:text-foreground"
                      )}
                    >
                      {isActive && <span aria-hidden="true" className={cn("absolute inset-x-3 top-0 h-1.5 rounded-b-md", group.fill)} />}
                      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      {tab.label}
                      {tab.badge ? (
                        <span className="rounded-md border-2 border-[var(--nb-border-color)] bg-nb-warning px-1.5 text-xs font-extrabold text-on-color">
                          {tab.badge}
                          <span className="sr-only"> pending</span>
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </nav>

        {/* Section content */}
        <div className="flex-1 rounded-2xl border-2 border-[var(--nb-border-color)] bg-card p-5 shadow-[var(--nb-shadow)] sm:p-6 md:p-8">
          <div key={pathname} className={tabDirection === 0 ? "animate-fade-in" : "nb-tab-in"} style={{ ["--dir" as string]: tabDirection }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
