"use client";

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { AlertTriangle, Trash2, LogOut } from "lucide-react";
import { useLogout } from "@/hooks/useLogout";
import PageHeader from "@/components/PageHeader";

import { deleteMyAccountApi } from "@/api/user.api";
import { setIsLoggedIn, setUser } from "@/store/slices/auth.slice";
import { handleDeleteAllEchoLinkApi } from "@/api/echo_link.api";
import { deleteAllMessagesInEchoShoutApi } from "@/api/echo_shout.api";
import { deleteAllSentMumblesApi, deleteAllRecievedMumblesApi } from "@/api/echo_mumble.api";
import ConfirmDialog from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";

interface DangerAction {
  label: string;
  desc: string;
  button: string;
  confirmTitle: string;
  done: string;
  failed: string;
  run: () => Promise<any>;
}

export default function MyAccountPage() {
  const { logout, isLoggingOut } = useLogout();
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [pendingAction, setPendingAction] = useState<DangerAction | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const deleteAccount = async () => {
    await deleteMyAccountApi();
    dispatch(setUser(null));
    dispatch(setIsLoggedIn(false));
    localStorage.setItem("allowFetch", "false");
    router.push("/");
  };

  const dataActions: DangerAction[] = [
    {
      label: "Private chats",
      desc: "Deletes every private conversation you're in, for you and the other person. Group chats aren't affected.",
      button: "Delete chats",
      confirmTitle: "Delete all your private chats?",
      done: "Your private chats were deleted.",
      failed: "We couldn't delete your chats. Please try again.",
      run: handleDeleteAllEchoLinkApi,
    },
    {
      label: "Received Mumbles",
      desc: "Clears your Mumble inbox, including anything you've pinned.",
      button: "Delete received",
      confirmTitle: "Delete all your received Mumbles?",
      done: "Your received Mumbles were deleted.",
      failed: "We couldn't delete your received Mumbles. Please try again.",
      run: deleteAllRecievedMumblesApi,
    },
    {
      label: "Sent Mumbles",
      desc: "Removes Mumbles you've sent from other people's inboxes.",
      button: "Delete sent",
      confirmTitle: "Delete all your sent Mumbles?",
      done: "Your sent Mumbles were deleted.",
      failed: "We couldn't delete your sent Mumbles. Please try again.",
      run: deleteAllSentMumblesApi,
    },
    {
      label: "EchoShout posts",
      desc: "Removes your posts from the public room.",
      button: "Delete posts",
      confirmTitle: "Delete all your EchoShout posts?",
      done: "Your EchoShout posts were deleted.",
      failed: "We couldn't delete your posts. Please try again.",
      run: deleteAllMessagesInEchoShoutApi,
    },
  ];

  const accountAction: DangerAction = {
    label: "Your account",
    desc: "Permanently removes your profile, friends and messages from EchoRealm.",
    button: "Delete account",
    confirmTitle: "Delete your account?",
    done: "Your account was deleted.",
    failed: "We couldn't delete your account. Please try again.",
    run: deleteAccount,
  };

  const confirm = async () => {
    if (!pendingAction) return;
    try {
      await pendingAction.run();
      toast.success(pendingAction.done);
    } catch (error) {
      console.error("Account action failed:", error);
      toast.error(pendingAction.failed);
    }
  };

  const renderRow = (action: DangerAction, emphasized = false) => (
    <div key={action.label} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h3 className="text-sm font-bold text-foreground">{action.label}</h3>
        <p className="text-sm font-medium text-muted-foreground">{action.desc}</p>
      </div>
      <Button
        variant={emphasized ? "destructive" : "outline"}
        onClick={() => {
          setPendingAction(action);
          setDialogOpen(true);
        }}
      >
        <Trash2 className="h-4 w-4" />
        {action.button}
      </Button>
    </div>
  );

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader as="h2" title="Settings" description="Sign out, clear your data or close your account." />

      <div className="flex flex-col gap-3 rounded-2xl border-[3px] border-[var(--nb-border-color)] bg-muted p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground">Log out</h3>
          <p className="text-sm font-medium text-muted-foreground">Sign out of EchoRealm on this device.</p>
        </div>
        <Button variant="outline" onClick={logout} loading={isLoggingOut}>
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Log out
        </Button>
      </div>

      <h3 className="pt-2 text-lg font-extrabold text-foreground">Danger zone</h3>

      <div className="flex items-start gap-3 rounded-2xl border-[3px] border-[var(--nb-border-color)] bg-nb-warning p-4 text-on-color">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <p className="text-sm font-bold">Everything on this page is permanent and can&apos;t be undone.</p>
      </div>

      <div className="divide-y-[3px] divide-[var(--nb-border-color)]">
        {dataActions.map((action) => renderRow(action))}
        {renderRow(accountAction, true)}
      </div>

      <ConfirmDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={pendingAction?.confirmTitle ?? ""}
        description={pendingAction?.desc ?? ""}
        confirmLabel={pendingAction?.button ?? "Delete"}
        onConfirm={confirm}
        requireText={pendingAction?.button === "Delete account" ? user?.username : undefined}
      />
    </div>
  );
}
