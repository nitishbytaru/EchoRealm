"use client";

import React, { useEffect } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import { store } from "@/store/store";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { setTheme, setIsChecked } from "@/store/slices/auth.slice";
import { RootState } from "@/store/store";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

function ThemeInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.auth.theme);

  // Load saved theme on client mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "business";
    dispatch(setTheme(savedTheme));
    dispatch(setIsChecked(savedTheme === "business"));
  }, [dispatch]);

  // Synchronize document classes/attributes whenever theme changes
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    if (theme === "dark" || theme === "business") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return <>{children}</>;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Provider store={store}>
        <ThemeInitializer>
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </ThemeInitializer>
      </Provider>
    </GoogleOAuthProvider>
  );
}
