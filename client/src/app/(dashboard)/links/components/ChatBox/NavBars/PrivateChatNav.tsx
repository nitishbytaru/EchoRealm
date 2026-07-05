"use client";

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
    <div className="flex items-center justify-between p-3 bg-slate-900/60 border border-slate-900 rounded-2xl backdrop-blur-xl">
      <div className="flex items-center space-x-3">
        {/* Back button for mobile view */}
        <Link href="/links" className="md:hidden p-1 text-slate-400 hover:text-white transition-colors">
          <ChevronLeft className="h-6 w-6" />
        </Link>

        <Avatar className="h-10 w-10 border border-indigo-500/30">
          <AvatarImage src={selectedChat?.avatar?.url} />
          <AvatarFallback className="bg-indigo-950 text-indigo-400">
            {selectedChat?.username?.slice(0, 2).toUpperCase() || "DM"}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-sm font-semibold text-white">@{selectedChat?.username || "anonymous"}</h3>
          <p className="text-[10px] text-slate-500">Private Whisper</p>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger render={
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white rounded-full">
            <MoreVertical className="h-4 w-4" />
          </Button>
        } />
        <DropdownMenuContent className="bg-slate-950 border-slate-800 text-white w-48">
          <DropdownMenuItem
            onClick={clearChat}
            className="hover:bg-slate-900 cursor-pointer text-xs flex gap-2"
          >
            <Eraser className="h-3.5 w-3.5" />
            Clear Chat
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={deleteChatRoom}
            className="hover:bg-slate-900 cursor-pointer text-xs flex gap-2"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete ChatRoom
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={blockSender}
            className="hover:bg-slate-900 cursor-pointer text-xs text-red-500 hover:text-red-400 flex gap-2"
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
