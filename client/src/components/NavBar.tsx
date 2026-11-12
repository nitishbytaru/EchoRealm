"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { ChevronDown, LogOut, Pin, Search, Settings, User, Users } from "lucide-react";

import socket from "@/sockets/socket";
import { handleToggle } from "@/utils/helpers/micro_funcs";
import { useFriendRequests } from "@/hooks/useFriendRequests";
import { useJoinRoomSocket } from "@/hooks/useJoinRoomSocket";
import { useGetRequestsSocket } from "@/hooks/useGetRequestsSocket";
import { useLogout } from "@/hooks/useLogout";
import CountBadge from "@/components/CountBadge";
import ThemeToggle from "@/components/ThemeToggle";
import { WORDMARK_SRC } from "@/components/brand/BrandMarks";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { setIsMobile, setTheme, setIsChecked } from "@/store/slices/auth.slice";
import { RootState } from "@/store/store";
import { SECTIONS } from "@/lib/sections";
import { cn } from "@/lib/utils";

export const NavBar: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { logout, isLoggingOut } = useLogout();

  const { user, isLoggedIn, isChecked } = useSelector((state: RootState) => state.auth);
  const { badgeOfPendingRequests } = useSelector((state: RootState) => state.user);
  const { newUnreadMessages } = useSelector((state: RootState) => state.echoLink);
  const { unReadMumbles } = useSelector((state: RootState) => state.echoMumble);

  useEffect(() => {
    const handleResize = () => dispatch(setIsMobile(window.innerWidth < 768));
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [dispatch]);

  useFriendRequests(user);
  useJoinRoomSocket(socket, user);
  useGetRequestsSocket(socket);

  const badges: Record<string, { count: number; label: string; className: string }> = {
    links: { count: newUnreadMessages, label: "conversations with unread messages", className: "bg-destructive" },
    mumble: { count: unReadMumbles, label: "unread Mumbles", className: "bg-nb-accent" },
  };

  const activeIndex = SECTIONS.findIndex((s) => pathname.startsWith(s.match));
  const active = SECTIONS[activeIndex];
  const onProfile = pathname.startsWith("/profile");
  const initials = user?.username?.slice(0, 2).toUpperCase() ?? "ME";

  const menuLinks = [
    { href: "/profile/edit", label: "My profile", icon: User },
    { href: "/profile/mumbles", label: "Pinned Mumbles", icon: Pin },
    { href: "/profile/friends/list", label: "Friends", icon: Users },
    { href: "/profile/find-users", label: "Find people", icon: Search },
    { href: "/profile/account", label: "Settings", icon: Settings },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b-[3px] border-[var(--nb-border-color)] bg-card text-foreground">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          {/* Brand: wordmark */}
          <Link href="/links" aria-label="EchoRealm home" className="flex shrink-0 items-center">
            <Image src={WORDMARK_SRC} alt="EchoRealm" width={928} height={250} priority className="h-8 w-auto -rotate-2 transition-transform duration-200 hover:rotate-0 sm:h-9" />
          </Link>

          {/* Sticker dock (tablet and up) */}
          {isLoggedIn && (
            <nav aria-label="Main" className="hidden md:block">
              <div className="relative grid grid-cols-3 rounded-2xl border-[3px] border-[var(--nb-border-color)] bg-muted p-1">
                <span
                  aria-hidden="true"
                  className={cn(
                    "nb-pill absolute inset-y-1 left-1 w-[calc((100%-0.5rem)/3)] rounded-xl border-[3px] border-[var(--nb-border-color)] shadow-[var(--nb-shadow-active)]",
                    active ? active.fill : "opacity-0"
                  )}
                  style={{ transform: `translateX(${Math.max(activeIndex, 0) * 100}%)` }}
                />
                {SECTIONS.map((section) => {
                  const Icon = section.icon;
                  const isActive = active?.key === section.key;
                  const badge = badges[section.key];
                  return (
                    <Link
                      key={section.key}
                      href={section.href}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "relative z-10 flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition-colors duration-200 lg:px-5",
                        isActive ? "text-on-color" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                      <span>{section.label}</span>
                      {badge && <CountBadge count={badge.count} label={badge.label} className={cn("-top-2 -right-1", badge.className)} />}
                    </Link>
                  );
                })}
              </div>
            </nav>
          )}

          {/* Theme + avatar menu */}
          <div className="flex shrink-0 items-center gap-3">
            <ThemeToggle handleToggle={(e) => handleToggle(e, dispatch, setTheme, setIsChecked)} isChecked={isChecked} />

            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <button
                      type="button"
                      aria-label="Your account menu"
                      className={cn(
                        "relative hidden items-center gap-2 rounded-xl border-[3px] border-[var(--nb-border-color)] py-1 pr-2 pl-1 text-sm font-bold shadow-[var(--nb-shadow-sm)] tap-interactive md:flex",
                        onProfile ? "bg-nb-accent text-on-color" : "bg-card text-foreground"
                      )}
                    />
                  }
                >
                  <Avatar size="sm">
                    <AvatarImage src={user?.avatar?.url} />
                    <AvatarFallback className="bg-primary text-[0.7rem] font-bold text-on-color">{initials}</AvatarFallback>
                  </Avatar>
                  <span className="hidden max-w-32 truncate lg:inline">@{user?.username}</span>
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                  <CountBadge count={badgeOfPendingRequests} label="pending friend requests" className="-top-2 -right-2 bg-nb-warning" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={10} className="w-64">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="flex items-center gap-3 px-2 py-2">
                      <Avatar>
                        <AvatarImage src={user?.avatar?.url} />
                        <AvatarFallback className="bg-primary text-xs font-bold text-on-color">{initials}</AvatarFallback>
                      </Avatar>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-extrabold">@{user?.username}</span>
                        {user?.email && <span className="block truncate text-xs font-medium text-muted-foreground">{user.email}</span>}
                      </span>
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  {menuLinks.map(({ href, label, icon: Icon }) => (
                    <DropdownMenuItem key={href} onClick={() => router.push(href)}>
                      <Icon aria-hidden="true" />
                      {label}
                      {href === "/profile/friends/list" && badgeOfPendingRequests > 0 && (
                        <span className="ml-auto rounded-md border-[2px] border-[var(--nb-border-color)] bg-nb-warning px-1.5 text-xs font-bold text-on-color">
                          {badgeOfPendingRequests} new
                        </span>
                      )}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" disabled={isLoggingOut} onClick={logout}>
                    <LogOut aria-hidden="true" />
                    {isLoggingOut ? "Logging out…" : "Log out"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>

      {/* Phone bottom dock */}
      {isLoggedIn && (
        <nav
          aria-label="Main"
          className="pb-safe fixed right-0 bottom-0 left-0 z-50 flex items-stretch justify-around border-t-[3px] border-[var(--nb-border-color)] bg-card md:hidden"
        >
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            const isActive = active?.key === section.key;
            const badge = badges[section.key];
            return (
              <Link
                key={section.key}
                href={section.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative flex h-16 flex-1 flex-col items-center justify-center gap-1",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
              >
                <span
                  className={cn(
                    "relative flex h-9 w-11 items-center justify-center rounded-xl transition-all duration-200",
                    isActive && cn(section.fill, "border-[2px] border-[var(--nb-border-color)] text-on-color shadow-[2px_2px_0_var(--nb-shadow-color)]")
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  {badge && <CountBadge count={badge.count} label={badge.label} className={cn("-top-2 -right-2", badge.className)} />}
                </span>
                <span className="text-xs font-bold">{section.label.replace("Echo", "")}</span>
              </Link>
            );
          })}
          <Link
            href="/profile/edit"
            aria-current={onProfile ? "page" : undefined}
            className={cn(
              "relative flex h-16 flex-1 flex-col items-center justify-center gap-1",
              onProfile ? "text-foreground" : "text-muted-foreground"
            )}
          >
            <span className="relative">
              <Avatar size="sm" className={cn(onProfile && "ring-3 ring-nb-accent")}>
                <AvatarImage src={user?.avatar?.url} />
                <AvatarFallback className="bg-primary text-[0.65rem] font-bold text-on-color">{initials}</AvatarFallback>
              </Avatar>
              <CountBadge count={badgeOfPendingRequests} label="pending friend requests" className="-top-2 -right-3 bg-nb-warning" />
            </span>
            <span className="text-xs font-bold">Me</span>
          </Link>
        </nav>
      )}
    </>
  );
};

export default NavBar;
