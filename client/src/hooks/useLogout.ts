"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { logoutApi } from "@/api/auth.api";
import { setUser, setIsLoggedIn } from "@/store/slices/auth.slice";

/** Log out, clear the session flag and return to the sign-in page. */
export function useLogout() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = async () => {
    try {
      setIsLoggingOut(true);
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
      setIsLoggingOut(false);
    }
  };

  return { logout, isLoggingOut };
}
