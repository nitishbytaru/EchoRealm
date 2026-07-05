"use client";

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { AlertTriangle, Trash2, Loader2 } from "lucide-react";

import { deleteMyAccountApi } from "@/api/user.api";
import { setIsLoggedIn, setUser } from "@/store/slices/auth.slice";
import { handleDeleteAllEchoLinkApi } from "@/api/echo_link.api";
import { deleteAllMessagesInEchoShoutApi } from "@/api/echo_shout.api";
import {
  deleteAllSentMumblesApi,
  deleteAllRecievedMumblesApi,
} from "@/api/echo_mumble.api";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export default function MyAccountPage() {
  const navigate = useRouter();
  const dispatch = useDispatch();
  const [isPending, setIsPending] = useState(false);

  const performAction = async (actionName: string, apiCall: () => Promise<any>, successCallback?: () => void) => {
    try {
      setIsPending(true);
      const response = await apiCall();
      toast.success(response?.data?.message || `${actionName} completed successfully.`);
      if (successCallback) {
        successCallback();
      }
    } catch (error) {
      console.error(`Error during ${actionName}:`, error);
      toast.error(`Failed to perform action: ${actionName}`);
    } finally {
      setIsPending(false);
    }
  };

  const deleteMyAccount = async () => {
    try {
      setIsPending(true);
      const response = await deleteMyAccountApi();
      dispatch(setUser(null));
      dispatch(setIsLoggedIn(false));
      localStorage.setItem("allowFetch", "false");
      toast.success(response?.data?.message || "Account deleted successfully.");
      navigate.push("/");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete the account.");
    } finally {
      setIsPending(false);
    }
  };

  const accountActions = [
    {
      label: "Delete All Chat Conversations",
      desc: "This will permanently delete all your private chat logs and group conversations. Other members will no longer see your historical chat messages.",
      actionName: "Delete Chats",
      api: handleDeleteAllEchoLinkApi,
    },
    {
      label: "Delete All Received Mumbles",
      desc: "This will permanently clear your inbox of all anonymous whispers you have received.",
      actionName: "Delete Received Mumbles",
      api: deleteAllRecievedMumblesApi,
    },
    {
      label: "Delete All Sent Mumbles",
      desc: "This will delete all the anonymous whispers you have sent to others. Recipients will no longer see them.",
      actionName: "Delete Sent Mumbles",
      api: deleteAllSentMumblesApi,
    },
    {
      label: "Delete All EchoShout Messages",
      desc: "This will permanently delete all your announcements and public posts on the EchoShout board.",
      actionName: "Delete Shout Messages",
      api: deleteAllMessagesInEchoShoutApi,
    },
  ];

  return (
    <div className="space-y-4 max-w-md mx-auto">
      <div className="space-y-0.5">
        <h2 className="text-xl font-bold tracking-tight text-red-500">
          Account Settings & Safety
        </h2>
        <p className="text-[10px] text-zinc-555 mt-0.5">Permanently manage or clear your stored data and active records</p>
      </div>

      {/* Danger Zone Banner */}
      <div className="flex gap-2 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl items-start">
        <AlertTriangle className="h-4 w-4 text-rose-450 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <h4 className="text-xs font-semibold text-rose-250">Danger Zone</h4>
          <p className="text-[9px] text-rose-500/70 leading-relaxed font-light">
            Performing any action below is permanent and cannot be undone. Please be absolutely certain before proceeding.
          </p>
        </div>
      </div>

      {isPending && (
        <div className="flex justify-center p-4">
          <Loader2 className="h-5 w-5 animate-spin text-red-500" />
        </div>
      )}

      <div className="space-y-4 pt-2">
        {accountActions.map((action, idx) => (
          <div key={idx} className="flex items-center justify-between p-4 bg-zinc-900/10 border border-zinc-900 rounded-xl card-interactive">
            <div className="space-y-0.5 max-w-[70%]">
              <h4 className="text-xs font-semibold text-zinc-200">{action.label}</h4>
              <p className="text-[9px] text-zinc-500 leading-normal">{action.desc}</p>
            </div>

            <AlertDialog>
              <AlertDialogTrigger render={
                <Button
                  variant="outline"
                  disabled={isPending}
                  className="border-zinc-800 bg-transparent text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 text-[10px] h-8 rounded-lg px-3 tap-interactive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Data
                </Button>
              } />
              <AlertDialogContent className="bg-zinc-950 border-zinc-900 text-zinc-200 max-w-sm rounded-lg">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-xs font-bold text-red-500">Confirm Deletion</AlertDialogTitle>
                  <AlertDialogDescription className="text-[10px] text-zinc-400">
                    Are you absolutely sure you want to delete {action.actionName.toLowerCase()}? This action is permanent and irreversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2 mt-2">
                  <AlertDialogCancel className="bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-100 text-xs rounded-lg tap-interactive">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => performAction(action.actionName, action.api)}
                    className="bg-red-650 hover:bg-red-750 text-white text-xs rounded-lg tap-interactive"
                  >
                    Delete Permanently
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ))}

        {/* Delete My Account Option */}
        <div className="flex items-center justify-between p-4 bg-red-500/5 border border-red-555/10 rounded-xl mt-4 card-interactive">
          <div className="space-y-0.5 max-w-[70%]">
            <h4 className="text-xs font-bold text-rose-250">Delete My Account</h4>
            <p className="text-[9px] text-zinc-500 leading-normal">
              Permanently terminate your EchoRealm profile, messages, friends lists, and whispers.
            </p>
          </div>

          <AlertDialog>
            <AlertDialogTrigger render={
              <Button
                disabled={isPending}
                className="bg-red-600 hover:bg-red-700 text-white text-[10px] h-8 rounded-lg px-3 shadow-sm shadow-red-950/20 tap-interactive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            } />
            <AlertDialogContent className="bg-zinc-950 border-zinc-900 text-zinc-200 max-w-sm rounded-lg">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-xs font-bold text-red-500">Confirm Account Deletion</AlertDialogTitle>
                <AlertDialogDescription className="text-[10px] text-zinc-400">
                  Are you absolutely sure you want to delete YOUR ACCOUNT? All your data will be permanently wiped from EchoRealm.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-2 mt-2">
                <AlertDialogCancel className="bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-100 text-xs rounded-lg tap-interactive">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={deleteMyAccount}
                  className="bg-red-650 hover:bg-red-750 text-white text-xs rounded-lg tap-interactive"
                >
                  Delete Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
