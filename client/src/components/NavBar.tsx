"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { Home, MessageSquare, Megaphone, Menu } from "lucide-react";

import socket from "@/sockets/socket";
import { handleToggle } from "@/utils/helpers/micro_funcs";
import { useFriendRequests } from "@/hooks/useFriendRequests";
import { useJoinRoomSocket } from "@/hooks/useJoinRoomSocket";
import { useGetRequestsSocket } from "@/hooks/useGetRequestsSocket";
import MumbleIcon from "@/components/MumbleIcon";
import ThemeToggle from "@/components/ThemeToggle";
import { setIsMobile, setTheme, setIsChecked } from "@/store/slices/auth.slice";
import { RootState } from "@/store/store";

export const NavBar: React.FC = () => {
  const dispatch = useDispatch();

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

  // Set the theme
  useEffect(() => {
    dispatch(setTheme(theme));
    document.documentElement.setAttribute("data-theme", theme);
    if (theme === "dark" || theme === "business") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dispatch, theme]);

  // Hook to fetch friendRequests and add notification badge
  useFriendRequests(user);

  // Hook for socket to join room to get notifications of new friendRequests
  useJoinRoomSocket(socket, user);

  // Hook for getting live updates like friendRequests
  useGetRequestsSocket(socket);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md text-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand/Home Logo */}
        <div className="flex items-center">
          <Link href="/links" className="text-xl font-bold tracking-wider bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent transition-opacity hover:opacity-90">
            {isMobile ? <Home className="h-6 w-6 text-indigo-400" /> : "EchoRealm"}
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex items-center space-x-1 bg-slate-900/60 p-1.5 rounded-full border border-slate-800/80">
          {isLoggedIn && (
            <div className="relative">
              <Link
                href="/links"
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-full hover:bg-slate-800/80 transition-all text-slate-300 hover:text-white"
              >
                <MessageSquare className="h-4 w-4" />
                {!isMobile && <span>EchoLink</span>}
              </Link>
              {newUnreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold shadow-md">
                  {newUnreadMessages}
                </span>
              )}
            </div>
          )}

          <div className="relative">
            <Link
              href="/shout"
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-full hover:bg-slate-800/80 transition-all text-slate-300 hover:text-white"
            >
              <Megaphone className="h-4 w-4" />
              {!isMobile && <span>EchoShout</span>}
            </Link>
          </div>

          {isLoggedIn && (
            <>
              <div className="relative px-3 py-1.5 text-xs font-semibold rounded-full hover:bg-slate-800/80 transition-all text-slate-300 hover:text-white">
                <MumbleIcon />
                {unReadMumbles > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold shadow-md">
                    {unReadMumbles}
                  </span>
                )}
              </div>

              {!isMobile && (
                <div className="relative">
                  <Link
                    href="/profile/mumbles"
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-full hover:bg-slate-800/80 transition-all text-slate-300 hover:text-white"
                  >
                    <Menu className="h-4 w-4" />
                    <span>About</span>
                  </Link>
                  {badgeOfPendingRequests > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold shadow-md">
                      {badgeOfPendingRequests}
                    </span>
                  )}
                </div>
              )}
            </>
          )}
        </nav>

        {/* Profile Avatar / Theme Toggle */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              {isMobile ? (
                <div className="relative">
                  <Link href="/profile/mumbles" className="p-2 hover:bg-slate-900 rounded-full block border border-slate-850">
                    <Menu className="h-5 w-5 text-slate-300" />
                  </Link>
                  {badgeOfPendingRequests > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold shadow-md">
                      {badgeOfPendingRequests}
                    </span>
                  )}
                </div>
              ) : (
                <Link href="/profile/mumbles" className="transition-transform active:scale-95">
                  <div className="flex items-center gap-2 bg-slate-900/80 pl-2 pr-3 py-1.5 rounded-full border border-slate-800/80 hover:bg-slate-800/80">
                    <div className="h-8 w-8 relative overflow-hidden rounded-full border border-indigo-500/50">
                      <img
                        src={user?.avatar?.url || "/default-avatar.png"}
                        alt="User Avatar"
                        className="object-cover h-full w-full"
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-300">{user?.username}</span>
                  </div>
                </Link>
              )}
            </div>
          ) : (
            <div className="flex items-center">
              <ThemeToggle
                handleToggle={(e) =>
                  handleToggle(e, dispatch, setTheme, setIsChecked)
                }
                isChecked={isChecked}
              />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default NavBar;
