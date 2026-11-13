"use client";

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { Trash2, ShieldAlert, MessageSquare, Inbox, Send, Megaphone, Users, User, UserX, X, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

import { deleteMyAccountApi } from "@/api/user.api";
import { setIsLoggedIn, setUser } from "@/store/slices/auth.slice";
import { handleDeleteAllEchoLinkApi } from "@/api/echo_link.api";
import { deleteAllMessagesInEchoShoutApi } from "@/api/echo_shout.api";
import { deleteAllSentMumblesApi, deleteAllRecievedMumblesApi } from "@/api/echo_mumble.api";
import ConfirmDialog from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";

interface DangerAction {
  label: string;
  /** Who else loses something when this runs. */
  scope?: { text: string; others: boolean };
  icon?: LucideIcon;
  desc: string;
  button: string;
  confirmTitle: string;
  done: string;
  failed: string;
  run: () => Promise<any>;
}

export default function MyAccountPage() {
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
      scope: { text: "You and the other person", others: true },
      icon: MessageSquare,
      desc: "Deletes every private conversation you're in, for you and the other person. Group chats aren't affected.",
      button: "Delete chats",
      confirmTitle: "Delete all your private chats?",
      done: "Your private chats were deleted.",
      failed: "We couldn't delete your chats. Please try again.",
      run: handleDeleteAllEchoLinkApi,
    },
    {
      label: "Received Mumbles",
      scope: { text: "Only you", others: false },
      icon: Inbox,
      desc: "Clears your Mumble inbox, including anything you've pinned.",
      button: "Delete received",
      confirmTitle: "Delete all your received Mumbles?",
      done: "Your received Mumbles were deleted.",
      failed: "We couldn't delete your received Mumbles. Please try again.",
      run: deleteAllRecievedMumblesApi,
    },
    {
      label: "Sent Mumbles",
      scope: { text: "Everyone who received them", others: true },
      icon: Send,
      desc: "Removes Mumbles you've sent from other people's inboxes.",
      button: "Delete sent",
      confirmTitle: "Delete all your sent Mumbles?",
      done: "Your sent Mumbles were deleted.",
      failed: "We couldn't delete your sent Mumbles. Please try again.",
      run: deleteAllSentMumblesApi,
    },
    {
      label: "EchoShout posts",
      scope: { text: "Everyone in EchoShout", others: true },
      icon: Megaphone,
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

  const ask = (action: DangerAction) => {
    setPendingAction(action);
    setDialogOpen(true);
  };

  return (
    <div className="nb-stagger mx-auto max-w-3xl space-y-8 [--nb-stagger-start:150ms]">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Settings</h2>
        <p className="mt-2 text-sm font-medium text-muted-foreground sm:text-base">
          Permanently delete parts of your EchoRealm data, or your whole account.
        </p>
      </div>

      {/* Warning */}
      <div role="note" className="flex gap-4 rounded-xl border-2 border-nb-danger-text/60 bg-destructive/10 p-4">
        <ShieldAlert className="mt-0.5 h-6 w-6 shrink-0 text-nb-danger-text" aria-hidden="true" />
        <div className="space-y-1">
          <p className="text-sm font-extrabold text-foreground">Everything on this page is permanent.</p>
          <p className="text-sm font-medium text-muted-foreground">
            Deleted data can&apos;t be recovered, by you or by us. Some actions also remove messages from other people&apos;s
            accounts. Each one asks you to confirm first.
          </p>
        </div>
      </div>

      {/* Data */}
      <section aria-labelledby="data-heading" className="space-y-3">
        <div>
          <h3 id="data-heading" className="text-lg font-extrabold text-foreground">Delete your data</h3>
          <p className="text-sm font-medium text-muted-foreground">Your account stays. Only the selected content is removed.</p>
        </div>
        <ul className="divide-y-2 divide-[var(--nb-line)] overflow-hidden rounded-xl border-2 border-[var(--nb-border-color)] bg-card">
          {dataActions.map((action) => {
            const Icon = action.icon ?? Trash2;
            return (
              <li key={action.label} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-5">
                <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-lg border-2 border-[var(--nb-line)] bg-muted text-muted-foreground">
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <h4 className="text-sm font-extrabold text-foreground">{action.label}</h4>
                  <p className="text-sm font-medium text-muted-foreground">{action.desc}</p>
                  {action.scope && (
                    <p className={cn("inline-flex items-center gap-1.5 text-xs font-bold", action.scope.others ? "text-nb-danger-text" : "text-muted-foreground")}>
                      {action.scope.others ? <Users className="size-3.5" aria-hidden="true" /> : <User className="size-3.5" aria-hidden="true" />}
                      Affects: {action.scope.text}
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  className="shrink-0 border-nb-danger-text/60 text-nb-danger-text shadow-none hover:bg-destructive/10 hover:shadow-none"
                  onClick={() => ask(action)}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  {action.button}
                </Button>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Account */}
      <section aria-labelledby="account-delete-heading" className="rounded-xl border-2 border-nb-danger-text bg-destructive/5 p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-destructive text-on-color">
            <UserX className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 id="account-delete-heading" className="text-lg font-extrabold text-foreground">Delete your account</h3>
            <p className="mt-1 text-sm font-medium text-muted-foreground">This closes your EchoRealm account for good. You&apos;ll lose:</p>
            <ul className="mt-3 grid gap-x-6 gap-y-1.5 text-sm font-semibold text-foreground sm:grid-cols-2">
              {["Your profile, picture and username", "Your friends and friend requests", "Your chats and group memberships", "Your Mumbles and EchoShout posts"].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <X className="mt-0.5 size-4 shrink-0 text-nb-danger-text" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm font-medium text-muted-foreground">
              You&apos;ll be asked to type your username to confirm.
            </p>
            <Button variant="destructive" className="mt-4 shadow-none hover:shadow-none" onClick={() => ask(accountAction)}>
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Delete my account
            </Button>
          </div>
        </div>
      </section>

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
