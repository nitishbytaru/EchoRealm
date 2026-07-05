"use client";

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";
import {
  User as UserIcon,
  Shield,
  Users,
  UserPlus2,
  UserX,
  Search,
  Settings,
  LogOut,
  Loader2,
} from "lucide-react";

import { logoutApi } from "@/api/auth.api";
import { setUser, setIsLoggedIn } from "@/store/slices/auth.slice";
import { RootState } from "@/store/store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileLayoutProps {
  children: React.ReactNode;
}

export default function ProfileLayout({ children }: ProfileLayoutProps) {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();

  const { user } = useSelector((state: RootState) => state.auth);
  const { badgeOfPendingRequests } = useSelector((state: RootState) => state.user);

  const [isPending, setIsPending] = useState(false);

  const handleLogout = async () => {
    try {
      setIsPending(true);
      const response = await logoutApi();
      toast.success(response?.data?.message || "Logged out successfully");
      dispatch(setUser(null));
      dispatch(setIsLoggedIn(false));
      localStorage.setItem("allowFetch", "false");
      router.push("/");
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error("Failed to log out. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  const navItems = [
    { href: "/profile/edit", label: "Profile", icon: UserIcon },
    { href: "/profile/mumbles", label: "My Mumbles", icon: Shield },
    { href: "/profile/friends/list", label: "My Friends", icon: Users },
    {
      href: "/profile/friends/requests",
      label: "Requests",
      icon: UserPlus2,
      badge: badgeOfPendingRequests,
    },
    { href: "/profile/blocked-users", label: "Blocked Users", icon: UserX },
    { href: "/profile/find-users", label: "Find Users", icon: Search },
    { href: "/profile/account", label: "Account Settings", icon: Settings },
  ];

  return (
    <div className="flex-1 flex flex-col md:flex-row gap-4 max-w-6xl mx-auto w-full min-h-[calc(100vh-140px)]">
      {/* Sidebar navigation */}
      <div className="w-full md:w-56 bg-zinc-900/10 border border-zinc-900 rounded-xl p-4 backdrop-blur-xl flex flex-col justify-between shrink-0 h-fit md:sticky md:top-20">
        <div className="space-y-4">
          {/* User Header */}
          <div className="flex flex-row md:flex-col items-center gap-3 md:text-center md:pb-3 md:border-b md:border-zinc-900">
            <Avatar className="h-12 w-12 md:h-16 md:w-16 border border-zinc-800 mx-auto">
              <AvatarImage src={user?.avatar?.url} />
              <AvatarFallback className="bg-zinc-950 text-indigo-400 text-sm">
                {user?.username?.slice(0, 2).toUpperCase() || "ME"}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-0.5">
              <h3 className="text-xs font-bold text-zinc-200 leading-tight">@{user?.username}</h3>
              <p className="text-[9px] text-zinc-500">{user?.email}</p>
            </div>
          </div>

          {/* Nav links */}
          <nav className="flex flex-row md:flex-col flex-wrap gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap relative tap-interactive ${
                    isActive
                      ? "bg-indigo-650/10 text-indigo-400 border border-indigo-500/20"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border border-transparent"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                  {item.badge && item.badge > 0 ? (
                    <span className="absolute right-2 bg-indigo-650 text-white text-[8px] font-bold h-4 min-w-[16px] px-1 rounded-md flex items-center justify-center">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout Button */}
        <div className="mt-4 border-t border-zinc-900 pt-4">
          <button
            onClick={handleLogout}
            disabled={isPending}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:text-rose-350 hover:bg-rose-500/5 border border-transparent transition-all w-full tap-interactive"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin text-rose-400" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            <span>Log out</span>
          </button>
        </div>
      </div>

      {/* Main dynamic profile page container */}
      <div className="flex-1 bg-zinc-900/10 border border-zinc-900 rounded-xl p-4 sm:p-5 md:p-6 overflow-y-auto hide-scrollBar">
        <div key={pathname} className="animate-fade-in-up">
          {children}
        </div>
      </div>
    </div>
  );
}
