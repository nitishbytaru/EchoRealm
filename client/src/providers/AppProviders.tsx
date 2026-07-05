"use client";

import { Provider } from "react-redux";
import { store } from "@/store/store";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { TooltipProvider } from "@/components/ui/tooltip";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Provider store={store}>
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </Provider>
    </GoogleOAuthProvider>
  );
}
