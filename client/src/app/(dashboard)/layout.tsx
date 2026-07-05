"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { getProfileApi } from "@/api/auth.api";
import { setIsLoggedIn, setUser } from "@/store/slices/auth.slice";
import NavBar from "@/components/NavBar";
import Loading from "@/components/Loading";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isLoggedIn, user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(!isLoggedIn);

  useEffect(() => {
    const checkAuth = async () => {
      // If already logged in, no need to check
      if (isLoggedIn && user) {
        setLoading(false);
        return;
      }

      // Check if we are allowed to fetch (e.g. have logged in before)
      const allowFetch = localStorage.getItem("allowFetch") === "true";
      if (!allowFetch) {
        router.push("/");
        return;
      }

      try {
        const response = await getProfileApi();
        if (response?.data?.user) {
          dispatch(setUser(response.data.user));
          dispatch(setIsLoggedIn(true));
          setLoading(false);
        } else {
          router.push("/");
        }
      } catch (error) {
        console.error("Dashboard auth check failed:", error);
        router.push("/");
      }
    };

    checkAuth();
  }, [isLoggedIn, user, dispatch, router]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-950">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-950 text-white relative">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-radial from-slate-900 via-slate-950 to-black pointer-events-none z-0" />
      
      <div className="relative z-10 flex flex-col min-h-screen w-full">
        <NavBar />
        <main className="flex-1 flex flex-col w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 z-10">
          {children}
        </main>
      </div>
    </div>
  );
}
