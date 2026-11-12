"use client";

import React, { useState } from "react";
import Handle from "@/components/Handle";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { ChevronLeft, MoreVertical, Trash2, ShieldAlert, Eraser } from "lucide-react";
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
    <div className="flex shrink-0 items-center justify-between gap-3 border-b-[3px] border-[var(--nb-border-color)] bg-card px-4 py-3">
      <div className="flex items-center space-x-3">
        {/* Back button for mobile view */}
        <Link href="/links" aria-label="Back to chats" className="md:hidden flex size-11 items-center justify-center text-muted-foreground hover:text-foreground transition-colors tap-interactive">
          <ChevronLeft className="h-6 w-6" />
        </Link>

        <Avatar className="size-11">
          <AvatarImage src={selectedChat?.avatar?.url} />
          <AvatarFallback className="bg-primary text-sm font-extrabold text-on-color">
            {selectedChat?.username?.slice(0, 2).toUpperCase() || "DM"}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-lg leading-tight text-foreground">{selectedChat?.username ? <Handle name={selectedChat.username} size="md" className="text-lg" /> : "Unknown"}</h3>
          <p className="text-sm text-muted-foreground font-medium">Private chat<span className="hidden sm:inline"> · only you two</span></p>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger render={
          <Button variant="outline" size="icon" aria-label="Chat options" className="tap-interactive">
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
