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
      <div className="w-full md:w-60 bg-card border-[3px] border-[var(--nb-border-color)] shadow-[var(--nb-shadow)] rounded-2xl p-5 flex flex-col justify-between shrink-0 h-fit md:sticky md:top-20">
        <div className="space-y-4">
          {/* User Header */}
          <div className="flex flex-row md:flex-col items-center gap-3 md:text-center md:pb-4 md:border-b-[3px] md:border-[var(--nb-border-color)]">
            <Avatar className="h-14 w-14 md:h-18 md:w-18 mx-auto" size="lg">
              <AvatarImage src={user?.avatar?.url} />
              <AvatarFallback className="bg-primary text-primary-foreground text-base font-extrabold">
                {user?.username?.slice(0, 2).toUpperCase() || "ME"}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h3 className="text-sm font-extrabold text-foreground leading-tight">@{user?.username}</h3>
              <p className="text-xs text-muted-foreground font-medium">{user?.email}</p>
            </div>
          </div>

          {/* Nav links */}
          <nav className="flex flex-row md:flex-col flex-wrap gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap relative tap-interactive border-[3px] ${
                    isActive
                      ? "bg-primary/20 text-foreground border-[var(--nb-border-color)] shadow-[var(--nb-shadow-sm)]"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted border-transparent hover:border-[var(--nb-border-color)]"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{item.label}</span>
                  {item.badge && item.badge > 0 ? (
                    <span className="absolute right-2 bg-nb-warning text-foreground text-[9px] font-extrabold h-5 min-w-[20px] px-1 rounded-lg flex items-center justify-center border-[2px] border-[var(--nb-border-color)]">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout Button */}
        <div className="mt-4 border-t-[3px] border-[var(--nb-border-color)] pt-4">
          <button
            onClick={handleLogout}
            disabled={isPending}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-white bg-destructive border-[3px] border-[var(--nb-border-color)] shadow-[var(--nb-shadow-sm)] hover:-translate-y-0.5 hover:shadow-[var(--nb-shadow)] active:translate-y-0.5 active:shadow-[var(--nb-shadow-active)] transition-all w-full"
          >
            {isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <LogOut className="h-5 w-5" />
            )}
            <span>Log out</span>
          </button>
        </div>
      </div>

      {/* Main dynamic profile page container */}
      <div className="flex-1 bg-card border-[3px] border-[var(--nb-border-color)] shadow-[var(--nb-shadow)] rounded-2xl p-5 sm:p-6 md:p-8 overflow-y-auto hide-scrollBar">
        <div key={pathname} className="animate-fade-in-up">
          {children}
        </div>
      </div>
    </div>
  );
}
