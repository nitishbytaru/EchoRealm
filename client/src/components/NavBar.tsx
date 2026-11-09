"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { MessageSquare, Megaphone, User } from "lucide-react";

import socket from "@/sockets/socket";
import { handleToggle } from "@/utils/helpers/micro_funcs";
import { useFriendRequests } from "@/hooks/useFriendRequests";
import { useJoinRoomSocket } from "@/hooks/useJoinRoomSocket";
import { useGetRequestsSocket } from "@/hooks/useGetRequestsSocket";
import MumbleIcon from "@/components/MumbleIcon";
import CountBadge from "@/components/CountBadge";
import ThemeToggle from "@/components/ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { setIsMobile, setTheme, setIsChecked } from "@/store/slices/auth.slice";
import { RootState } from "@/store/store";
import { cn } from "@/lib/utils";

export const NavBar: React.FC = () => {
  const dispatch = useDispatch();
  const pathname = usePathname();

  const { user, theme, isMobile, isLoggedIn, isChecked } = useSelector(
    (state: RootState) => state.auth
  );
  const { badgeOfPendingRequests } = useSelector((state: RootState) => state.user);
  const { newUnreadMessages } = useSelector((state: RootState) => state.echoLink);
  const { unReadMumbles } = useSelector((state: RootState) => state.echoMumble);

  // Update the isMobile state based on window size
  useEffect(() => {
    const handleResize = () => {
      dispatch(setIsMobile(window.innerWidth < 768));
    };

    handleResize(); // run initially
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [dispatch]);

  // Hook to fetch friendRequests and add notification badge
  useFriendRequests(user);

  // Hook for socket to join room to get notifications of new friendRequests
  useJoinRoomSocket(socket, user);

  // Hook for getting live updates like friendRequests
  useGetRequestsSocket(socket);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b-[3px] border-[var(--nb-border-color)] bg-card text-foreground">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

          {/* Brand/Home Logo */}
          <div className="flex items-center">
            <Link href="/links" className="transition-opacity hover:opacity-90 flex items-center">
              <Image
                src="https://res.cloudinary.com/dhysbx7mk/image/upload/v1784275596/echorealm/logos/text_logo_echorealm_ixkbqk.png"
                alt="EchoRealm"
                width={125}
                height={75}
                priority
                className="object-contain"
              />
            </Link>
          </div>

          {/* Navigation Items (Desktop Only) */}
          <nav aria-label="Main" className="hidden md:flex items-center space-x-2">
            {isLoggedIn && (
              <div className="relative">
                <Link
                  href="/links"
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl border-[3px] transition-all duration-150 tap-interactive",
                    pathname.startsWith("/links")
                      ? "bg-primary text-primary-foreground border-[var(--nb-border-color)] shadow-[var(--nb-shadow-sm)]"
                      : "text-muted-foreground border-transparent hover:text-foreground hover:bg-muted hover:border-[var(--nb-border-color)]"
                  )}
                >
                  <MessageSquare className="h-5 w-5" />
                  <span>EchoLink</span>
                </Link>
                <CountBadge count={newUnreadMessages} label="conversations with unread messages" className="-top-2 -right-2 bg-destructive" />
              </div>
            )}

            <div className="relative">
              <Link
                href="/shout"
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl border-[3px] transition-all duration-150 tap-interactive",
                  pathname.startsWith("/shout")
                    ? "bg-secondary text-secondary-foreground border-[var(--nb-border-color)] shadow-[var(--nb-shadow-sm)]"
                    : "text-muted-foreground border-transparent hover:text-foreground hover:bg-muted hover:border-[var(--nb-border-color)]"
                )}
              >
                <Megaphone className="h-5 w-5" />
                <span>EchoShout</span>
              </Link>
            </div>

            {isLoggedIn && (
              <>
                <MumbleIcon />

                <div className="relative">
                  <Link
                    href="/profile/mumbles"
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl border-[3px] transition-all duration-150 tap-interactive",
                      pathname.startsWith("/profile")
                        ? "bg-nb-accent text-on-color border-[var(--nb-border-color)] shadow-[var(--nb-shadow-sm)]"
                        : "text-muted-foreground border-transparent hover:text-foreground hover:bg-muted hover:border-[var(--nb-border-color)]"
                    )}
                  >
                    <User className="h-5 w-5" />
                    <span>Profile</span>
                  </Link>
                  <CountBadge count={badgeOfPendingRequests} label="pending friend requests" className="-top-2 -right-2 bg-nb-warning" />
                </div>
              </>
            )}
          </nav>

          {/* Profile Avatar / Theme Toggle */}
          <div className="flex items-center gap-3">
            <ThemeToggle
              handleToggle={(e) =>
                handleToggle(e, dispatch, setTheme, setIsChecked)
              }
              isChecked={isChecked}
            />

            {user && (
              <div className="flex items-center">
                {isMobile ? (
                  <Link href="/profile/edit" aria-label="Edit your profile" className="tap-interactive">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar?.url} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {user.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                ) : (
                  <Link href="/profile/edit" aria-label="Edit your profile" className="tap-interactive">
                    <div className="flex items-center gap-2 bg-card pl-2 pr-3 py-1.5 rounded-xl border-[3px] border-[var(--nb-border-color)] shadow-[var(--nb-shadow-sm)] hover:shadow-[var(--nb-shadow)] transition-all">
                      <Avatar className="h-6 w-6 border-[2px]">
                        <AvatarImage src={user?.avatar?.url} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {user.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-bold text-foreground">@{user?.username}</span>
                    </div>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      {isLoggedIn && (
        <nav aria-label="Main" className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card border-t-[3px] border-[var(--nb-border-color)] flex items-stretch justify-around pb-safe">
          {/* Chats */}
          <Link
            href="/links"
            className={cn(
              "flex flex-col items-center justify-center gap-1 flex-1 h-full relative transition-all duration-150 tap-interactive",
              pathname.startsWith("/links")
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div className={cn(
              "flex items-center justify-center w-10 h-10 rounded-xl transition-all",
              pathname.startsWith("/links") && "bg-primary border-[2px] border-[var(--nb-border-color)] shadow-[2px_2px_0px_var(--nb-shadow-color)]"
            )}>
              <MessageSquare className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold">EchoLink</span>
            <CountBadge count={newUnreadMessages} label="conversations with unread messages" className="top-1 right-3 bg-destructive" />
          </Link>

          {/* Shouts */}
          <Link
            href="/shout"
            className={cn(
              "flex flex-col items-center justify-center gap-1 flex-1 h-full relative transition-all duration-150 tap-interactive",
              pathname.startsWith("/shout")
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div className={cn(
              "flex items-center justify-center w-10 h-10 rounded-xl transition-all",
              pathname.startsWith("/shout") && "bg-secondary border-[2px] border-[var(--nb-border-color)] shadow-[2px_2px_0px_var(--nb-shadow-color)]"
            )}>
              <Megaphone className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold">EchoShout</span>
          </Link>

          {/* Mumbles */}
          <MumbleIcon isBottomNav />

          {/* Profile */}
          <Link
            href="/profile/mumbles"
            className={cn(
              "flex flex-col items-center justify-center gap-1 flex-1 h-full relative transition-all duration-150 tap-interactive",
              pathname.startsWith("/profile")
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div className={cn(
              "flex items-center justify-center w-10 h-10 rounded-xl transition-all",
              pathname.startsWith("/profile") && "bg-nb-accent border-[2px] border-[var(--nb-border-color)] shadow-[2px_2px_0px_var(--nb-shadow-color)]"
            )}>
              <User className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold">Profile</span>
            <CountBadge count={badgeOfPendingRequests} label="pending friend requests" className="top-1 right-3 bg-nb-warning" />
          </Link>
        </nav>
      )}
    </>
  );
};

export default NavBar;
