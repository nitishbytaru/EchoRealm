"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Home, MessageSquare, Megaphone, Menu, User } from "lucide-react";

import socket from "@/sockets/socket";
import { handleToggle } from "@/utils/helpers/micro_funcs";
import { useFriendRequests } from "@/hooks/useFriendRequests";
import { useJoinRoomSocket } from "@/hooks/useJoinRoomSocket";
import { useGetRequestsSocket } from "@/hooks/useGetRequestsSocket";
import MumbleIcon from "@/components/MumbleIcon";
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
      dispatch(setIsMobile(window.innerWidth < 670));
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
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md text-foreground">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Brand/Home Logo */}
          <div className="flex items-center">
            <Link href="/links" className="text-sm font-extrabold tracking-tight text-foreground transition-opacity hover:opacity-90">
              EchoRealm
            </Link>
          </div>

          {/* Navigation Items (Desktop Only) */}
          <nav className="hidden md:flex items-center space-x-2">
            {isLoggedIn && (
              <div className="relative">
                <Link
                  href="/links"
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg hover:bg-muted transition-all text-muted-foreground hover:text-foreground tap-interactive",
                    pathname.startsWith("/links") && "text-indigo-400 hover:text-indigo-400"
                  )}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>EchoLink</span>
                </Link>
                {newUnreadMessages > 0 && (
                  <span className="absolute -top-1 -right-1 bg-indigo-650 text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-bold shadow-md shadow-black/40">
                    {newUnreadMessages}
                  </span>
                )}
              </div>
            )}

            <div className="relative">
              <Link
                href="/shout"
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg hover:bg-muted transition-all text-muted-foreground hover:text-foreground tap-interactive",
                  pathname.startsWith("/shout") && "text-indigo-400 hover:text-indigo-400"
                )}
              >
                <Megaphone className="h-4 w-4" />
                <span>EchoShout</span>
              </Link>
            </div>

            {isLoggedIn && (
              <>
                <div className="relative px-3 py-2 text-xs font-medium rounded-lg hover:bg-muted transition-all text-muted-foreground hover:text-foreground cursor-pointer tap-interactive">
                  <MumbleIcon />
                  {unReadMumbles > 0 && (
                    <span className="absolute -top-1 -right-1 bg-indigo-650 text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-bold shadow-md shadow-black/40">
                      {unReadMumbles}
                    </span>
                  )}
                </div>

                <div className="relative">
                  <Link
                    href="/profile/mumbles"
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg hover:bg-muted transition-all text-muted-foreground hover:text-foreground tap-interactive",
                      pathname.startsWith("/profile") && "text-indigo-400 hover:text-indigo-400"
                    )}
                  >
                    <Menu className="h-4 w-4" />
                    <span>About</span>
                  </Link>
                  {badgeOfPendingRequests > 0 && (
                    <span className="absolute -top-1 -right-1 bg-indigo-650 text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-bold shadow-md shadow-black/40">
                      {badgeOfPendingRequests}
                    </span>
                  )}
                </div>
              </>
            )}
          </nav>

          {/* Profile Avatar / Theme Toggle */}
          <div className="flex items-center gap-2.5">
            <ThemeToggle
              handleToggle={(e) =>
                handleToggle(e, dispatch, setTheme, setIsChecked)
              }
              isChecked={isChecked}
            />

            {user && (
              <div className="flex items-center">
                {isMobile ? (
                  <Link href="/profile/edit" className="tap-interactive">
                    <Avatar className="h-7 w-7 border border-zinc-800">
                      <AvatarImage src={user?.avatar?.url} />
                      <AvatarFallback className="bg-zinc-950 text-indigo-400 text-[10px] border border-zinc-900">
                        {user.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                ) : (
                  <Link href="/profile/mumbles" className="tap-interactive">
                    <div className="flex items-center gap-2 bg-muted pl-2 pr-3 py-1 rounded-lg border border-border hover:bg-accent transition-colors">
                      <Avatar className="h-5 w-5 border border-border">
                        <AvatarImage src={user?.avatar?.url} />
                        <AvatarFallback className="bg-background text-indigo-400 text-[9px]">
                          {user.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-[11px] font-medium text-muted-foreground">@{user?.username}</span>
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
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/80 border-t border-border backdrop-blur-md flex items-center justify-around h-16 pb-safe">
          {/* Chats */}
          <Link
            href="/links"
            className={cn(
              "flex flex-col items-center justify-center gap-1 flex-1 h-full text-muted-foreground hover:text-foreground relative transition-colors tap-interactive",
              pathname.startsWith("/links") && "text-indigo-400 hover:text-indigo-400"
            )}
          >
            <MessageSquare className="h-5 w-5" />
            <span className="text-[9px] font-medium">Chats</span>
            {newUnreadMessages > 0 && (
              <span className="absolute top-2.5 right-6 bg-indigo-650 text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-bold shadow-md">
                {newUnreadMessages}
              </span>
            )}
          </Link>

          {/* Shouts */}
          <Link
            href="/shout"
            className={cn(
              "flex flex-col items-center justify-center gap-1 flex-1 h-full text-muted-foreground hover:text-foreground relative transition-colors tap-interactive",
              pathname.startsWith("/shout") && "text-indigo-400 hover:text-indigo-400"
            )}
          >
            <Megaphone className="h-5 w-5" />
            <span className="text-[9px] font-medium">Shouts</span>
          </Link>

          {/* Mumbles */}
          <div className="flex-1 h-full flex items-center justify-center">
            <MumbleIcon isBottomNav={true} />
          </div>

          {/* Profile */}
          <Link
            href="/profile/mumbles"
            className={cn(
              "flex flex-col items-center justify-center gap-1 flex-1 h-full text-muted-foreground hover:text-foreground relative transition-colors tap-interactive",
              pathname.startsWith("/profile") && "text-indigo-400 hover:text-indigo-400"
            )}
          >
            <User className="h-5 w-5" />
            <span className="text-[9px] font-medium">Profile</span>
            {badgeOfPendingRequests > 0 && (
              <span className="absolute top-2.5 right-6 bg-indigo-650 text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-bold shadow-md">
                {badgeOfPendingRequests}
              </span>
            )}
          </Link>
        </nav>
      )}
    </>
  );
};

export default NavBar;
