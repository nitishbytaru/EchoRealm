"use client";

import React from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

  const uniqueRoomId = createUniquechatRoom(selectedChat?._id || "", user?._id || "");

  const clearChat = async () => {
    try {
      setIsPendingOperation(true);
      const response = await clearChatApi(uniqueRoomId);
      dispatch(setPrivateMessages([]));
      toast.success(response?.data?.message || "Chat cleared.");
    } catch (error) {
      console.error("Error clearing chat:", error);
      toast.error("Failed to clear the chat.");
    } finally {
      setIsPendingOperation(false);
    }
  };

  const deleteChatRoom = async () => {
    try {
      setIsPendingOperation(true);
      const response = await deleteChatRoomApi(uniqueRoomId);
      toast.success(response?.data?.message || "Chatroom deleted.");
      dispatch(removeFromMyPrivateChatRooms(uniqueRoomId));
      router.push("/links");
    } catch (error) {
      console.error("Error deleting chat room:", error);
      toast.error("Failed to delete the chat room.");
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
      toast.error("Failed to block user.");
    } finally {
      setIsPendingOperation(false);
    }
  };

  return (
    <div
      className="flex items-center justify-between p-3 rounded-2xl backdrop-blur-xl border-0"
      style={{
        background: "var(--background)",
        boxShadow: "var(--nm-raised, 0 4px 16px rgba(0,0,0,0.15))",
      }}
    >
      <div className="flex items-center space-x-3">
        {/* Back button for mobile view */}
        <Link href="/links" className="md:hidden p-1 text-muted-foreground hover:text-foreground transition-colors tap-interactive">
          <ChevronLeft className="h-6 w-6" />
        </Link>

        <Avatar
          className="h-10 w-10 border-0"
          style={{ boxShadow: "var(--nm-flat, 0 2px 6px rgba(0,0,0,0.12))" }}
        >
          <AvatarImage src={selectedChat?.avatar?.url} />
          <AvatarFallback
            className="text-indigo-500 text-sm font-semibold"
            style={{ background: "var(--background)" }}
          >
            {selectedChat?.username?.slice(0, 2).toUpperCase() || "DM"}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-sm font-semibold text-foreground">@{selectedChat?.username || "anonymous"}</h3>
          <p className="text-[10px] text-muted-foreground">Private Whisper</p>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger render={
          <button
            className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground transition-all duration-150 tap-interactive border-0"
            style={{ background: "var(--background)", boxShadow: "var(--nm-raised, 0 2px 6px rgba(0,0,0,0.12))" }}
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        } />
        <DropdownMenuContent
          className="rounded-xl w-48 p-1 border-0 text-foreground"
          style={{
            background: "var(--background)",
            boxShadow: "8px 8px 20px var(--nm-dark, rgba(0,0,0,0.2)), -4px -4px 12px var(--nm-light, rgba(255,255,255,0.8))",
          }}
        >
          <DropdownMenuItem
            onClick={clearChat}
            className="hover:bg-accent hover:text-foreground cursor-pointer text-xs flex gap-2 rounded-lg"
          >
            <Eraser className="h-3.5 w-3.5" />
            Clear Chat
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={deleteChatRoom}
            className="hover:bg-accent hover:text-foreground cursor-pointer text-xs flex gap-2 rounded-lg"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete ChatRoom
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={blockSender}
            className="hover:bg-accent cursor-pointer text-xs text-rose-500 hover:text-rose-600 flex gap-2 rounded-lg"
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            Block User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default PrivateChatNav;
