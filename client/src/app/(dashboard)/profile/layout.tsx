"use client";

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
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
    <div className="flex-1 flex flex-col md:flex-row gap-6 max-w-6xl mx-auto w-full min-h-[calc(100vh-140px)]">
      {/* Sidebar navigation */}
      <div className="w-full md:w-64 bg-slate-905/30 border border-slate-900 rounded-3xl p-5 md:p-6 backdrop-blur-xl flex flex-col justify-between shrink-0 h-fit md:sticky md:top-20">
        <div className="space-y-6">
          {/* User Header */}
          <div className="flex flex-row md:flex-col items-center gap-4 md:text-center md:pb-4 md:border-b md:border-slate-900">
            <Avatar className="h-14 w-14 md:h-20 md:w-20 border-2 border-indigo-500/30">
              <AvatarImage src={user?.avatar?.url} />
              <AvatarFallback className="bg-indigo-950 text-indigo-400 text-lg">
                {user?.username?.slice(0, 2).toUpperCase() || "ME"}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white leading-tight">@{user?.username}</h3>
              <p className="text-[10px] text-slate-500">{user?.email}</p>
            </div>
          </div>

          {/* Nav links */}
          <nav className="flex flex-row md:flex-col flex-wrap gap-1 md:gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap relative ${
                    isActive
                      ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-900/40 border border-transparent"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                  {item.badge && item.badge > 0 ? (
                    <span className="absolute right-2 bg-indigo-500 text-white text-[9px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout Button */}
        <div className="mt-6 border-t border-slate-900 pt-4 md:pt-6">
          <button
            onClick={handleLogout}
            disabled={isPending}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-450 hover:text-white hover:bg-rose-500/10 border border-transparent transition-all w-full"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin text-rose-450" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            <span>Log out</span>
          </button>
        </div>
      </div>

      {/* Main dynamic profile page container */}
      <div className="flex-1 bg-slate-905/20 border border-slate-900/60 rounded-3xl p-5 sm:p-6 md:p-8 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
