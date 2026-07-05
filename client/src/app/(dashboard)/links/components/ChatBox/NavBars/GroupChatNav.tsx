"use client";

import React from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronLeft, MoreVertical, LogOut, UserPlus, UserMinus } from "lucide-react";
import Link from "next/link";

import { leaveFromGroupChatApi } from "@/api/echo_link.api";
import { truncateMessage } from "@/utils/helpers/micro_funcs";
import { RootState } from "@/store/store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface GroupChatNavProps {
  setIsPendingOperation: (pending: boolean) => void;
  setOpenAddToGroup: (open: boolean) => void;
  setOpenRemoveFromGroup: (open: boolean) => void;
}

export const GroupChatNav: React.FC<GroupChatNavProps> = ({
  setIsPendingOperation,
  setOpenAddToGroup,
  setOpenRemoveFromGroup,
}) => {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const { selectedChat } = useSelector((state: RootState) => state.echoLink);

  const leaveGroup = async () => {
    if (!selectedChat?._id) return;
    try {
      setIsPendingOperation(true);
      const response = await leaveFromGroupChatApi(selectedChat._id);
      toast.success(response?.data?.message || "Left group successfully.");
      router.push("/links");
    } catch (error) {
      console.error("Error leaving group:", error);
      toast.error("Failed to leave group.");
    } finally {
      setIsPendingOperation(false);
    }
  };

  const isAdmin = selectedChat?.admin?._id === user?._id || selectedChat?.admin === user?._id;

  const membersListStr = selectedChat?.groupChatRoomMembers
    ?.map((member: any) => member.username)
    .join(", ") || "";

  return (
    <div className="flex items-center justify-between p-3 bg-slate-900/60 border border-slate-900 rounded-2xl backdrop-blur-xl">
      <div className="flex items-center space-x-3 max-w-[70%]">
        {/* Back button for mobile view */}
        <Link href="/links" className="md:hidden p-1 text-slate-400 hover:text-white transition-colors">
          <ChevronLeft className="h-6 w-6" />
        </Link>

        <Avatar className="h-10 w-10 border border-indigo-500/30">
          <AvatarImage src={selectedChat?.groupProfile?.url} />
          <AvatarFallback className="bg-purple-955 text-purple-400">
            {selectedChat?.groupName?.slice(0, 2).toUpperCase() || "GC"}
          </AvatarFallback>
        </Avatar>
        <div className="overflow-hidden">
          <h3 className="text-sm font-semibold text-white truncate">{selectedChat?.groupName || "Group Chat"}</h3>
          <p className="text-[10px] text-slate-500 truncate" title={membersListStr}>
            {truncateMessage(membersListStr, 40)}
          </p>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger render={
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white rounded-full">
            <MoreVertical className="h-4 w-4" />
          </Button>
        } />
        <DropdownMenuContent className="bg-slate-950 border-slate-800 text-white w-48">
          {isAdmin ? (
            <>
              <DropdownMenuItem
                onClick={() => setOpenAddToGroup(true)}
                className="hover:bg-slate-900 cursor-pointer text-xs flex gap-2"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Add Members
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setOpenRemoveFromGroup(true)}
                className="hover:bg-slate-900 cursor-pointer text-xs flex gap-2"
              >
                <UserMinus className="h-3.5 w-3.5" />
                Remove Members
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem
              onClick={leaveGroup}
              className="hover:bg-slate-900 cursor-pointer text-xs text-rose-450 hover:text-rose-400 flex gap-2"
            >
              <LogOut className="h-3.5 w-3.5" />
              Leave Group
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default GroupChatNav;
