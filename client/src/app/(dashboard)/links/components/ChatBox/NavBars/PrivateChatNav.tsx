"use client";

import React, { useState } from "react";
import Handle from "@/components/Handle";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { ChevronLeft, MoreVertical, Trash2, ShieldAlert, Eraser, MessageCircle } from "lucide-react";
import { chipColor } from "@/lib/chipColor";
import { cn } from "@/lib/utils";
import Link from "next/link";

import { clearChatApi, deleteChatRoomApi } from "@/api/echo_link.api";
import { handleRemoveOrBlockMyFriendApi } from "@/api/friends.api";
import { createUniquechatRoom } from "@/utils/helpers/micro_funcs";
import {
  removeFromMyPrivateChatRooms,
  setPrivateMessages,
} from "@/store/slices/echo_link.slice";
import { RootState } from "@/store/store";
import ConfirmDialog from "@/components/ConfirmDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PrivateChatNavProps {
  setIsPendingOperation: (pending: boolean) => void;
}

export const PrivateChatNav: React.FC<PrivateChatNavProps> = ({
  setIsPendingOperation,
}) => {
  const dispatch = useDispatch();
  const router = useRouter();

  const { user } = useSelector((state: RootState) => state.auth);
  const { selectedChat } = useSelector((state: RootState) => state.echoLink);

  const [confirming, setConfirming] = useState<"clear" | "delete" | "block" | null>(null);
  const name = `@${selectedChat?.username ?? "this person"}`;

  const uniqueRoomId = createUniquechatRoom(selectedChat?._id || "", user?._id || "");

  const clearChat = async () => {
    try {
      setIsPendingOperation(true);
      await clearChatApi(uniqueRoomId);
      dispatch(setPrivateMessages([]));
      toast.success("Chat cleared.");
    } catch (error) {
      console.error("Error clearing chat:", error);
      toast.error("We couldn't clear this chat. Please try again.");
    } finally {
      setIsPendingOperation(false);
    }
  };

  const deleteChatRoom = async () => {
    try {
      setIsPendingOperation(true);
      await deleteChatRoomApi(uniqueRoomId);
      toast.success("Chat deleted.");
      dispatch(removeFromMyPrivateChatRooms(uniqueRoomId));
      router.push("/links");
    } catch (error) {
      console.error("Error deleting chat room:", error);
      toast.error("We couldn't delete this chat. Please try again.");
    } finally {
      setIsPendingOperation(false);
    }
  };

  const blockSender = async () => {
    const senderId = selectedChat?._id;
    if (!senderId) return;
    try {
      setIsPendingOperation(true);
      const response = await handleRemoveOrBlockMyFriendApi({
        friendId: senderId,
        action: "block",
      });
      toast.success(response?.data?.message || "User blocked.");
      dispatch(removeFromMyPrivateChatRooms(uniqueRoomId));
      router.push("/links");
    } catch (error) {
      console.error("Error blocking sender:", error);
      toast.error("We couldn't block this person. Please try again.");
    } finally {
      setIsPendingOperation(false);
    }
  };

  return (
    <div className="flex shrink-0 items-center justify-between gap-3 border-b-2 border-[var(--nb-line)] bg-card px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        {/* Back button for mobile view */}
        <Link href="/links" aria-label="Back to chats" className="flex size-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden">
          <ChevronLeft className="h-6 w-6" />
        </Link>

        <Link href={selectedChat?._id ? `/profile/view/${selectedChat._id}` : "#"} className="group/who flex min-w-0 items-center gap-3" title="View profile">
          <span className={cn("shrink-0 rounded-full p-[3px] transition-transform duration-200 group-hover/who:-rotate-6", chipColor(selectedChat?.username))}>
            <Avatar className="size-11 border-2 border-card shadow-none">
              <AvatarImage src={selectedChat?.avatar?.url} className="object-cover" />
              <AvatarFallback className="bg-card text-sm font-extrabold text-foreground">
                {selectedChat?.username?.slice(0, 2).toUpperCase() || "DM"}
              </AvatarFallback>
            </Avatar>
          </span>
          <h3 className="min-w-0 text-foreground">
            {selectedChat?.username ? <Handle name={selectedChat.username} className="max-w-full text-xl" /> : "Unknown"}
          </h3>
        </Link>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {selectedChat?._id && (
          <Link
            href={`/mumbles/send/${selectedChat._id}`}
            aria-label={`Send @${selectedChat?.username ?? ""} a Mumble`}
            title="Send a Mumble"
            className="flex size-10 items-center justify-center rounded-xl border-2 border-[var(--nb-border-color)] bg-nb-accent text-on-color shadow-[var(--nb-shadow-sm)] tap-interactive"
          >
            <MessageCircle className="h-5 w-5" aria-hidden="true" />
          </Link>
        )}
      <DropdownMenu>
        <DropdownMenuTrigger render={
          <Button variant="outline" size="icon" aria-label="Chat options" className="size-10">
            <MoreVertical className="h-4 w-4" />
          </Button>
        } />
        <DropdownMenuContent className="w-48">
          <DropdownMenuItem onClick={() => setConfirming("clear")}>
            <Eraser className="h-4 w-4" />
            Clear Chat
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setConfirming("delete")}>
            <Trash2 className="h-4 w-4" />
            Delete Chat
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setConfirming("block")} variant="destructive">
            <ShieldAlert className="h-4 w-4" />
            Block User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      </div>

      <ConfirmDialog
        open={confirming !== null}
        onOpenChange={(open) => !open && setConfirming(null)}
        title={
          confirming === "clear"
            ? `Clear your chat with ${name}?`
            : confirming === "delete"
            ? `Delete your chat with ${name}?`
            : `Block ${name}?`
        }
        description={
          confirming === "clear"
            ? "All messages will disappear for both of you. This can't be undone."
            : confirming === "delete"
            ? "The whole conversation will be removed for both of you. This can't be undone."
            : "They'll be removed from your friends and this chat will close. You can unblock them later in Profile."
        }
        confirmLabel={confirming === "clear" ? "Clear chat" : confirming === "delete" ? "Delete chat" : "Block"}
        onConfirm={confirming === "clear" ? clearChat : confirming === "delete" ? deleteChatRoom : blockSender}
      />
    </div>
  );
};

export default PrivateChatNav;
