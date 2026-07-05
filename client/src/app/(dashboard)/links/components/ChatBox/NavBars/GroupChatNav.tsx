"use client";

import React from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
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
    <div
      className="flex items-center justify-between p-3 rounded-2xl backdrop-blur-xl border-0"
      style={{
        background: "var(--background)",
        boxShadow: "var(--nm-raised, 0 4px 16px rgba(0,0,0,0.15))",
      }}
    >
      <div className="flex items-center space-x-3 max-w-[70%]">
        {/* Back button for mobile view */}
        <Link href="/links" className="md:hidden p-1 text-muted-foreground hover:text-foreground transition-colors tap-interactive">
          <ChevronLeft className="h-6 w-6" />
        </Link>

        <Avatar
          className="h-10 w-10 border-0"
          style={{ boxShadow: "var(--nm-flat, 0 2px 6px rgba(0,0,0,0.12))" }}
        >
          <AvatarImage src={selectedChat?.groupProfile?.url} />
          <AvatarFallback
            className="text-indigo-500 text-sm font-semibold"
            style={{ background: "var(--background)" }}
          >
            {selectedChat?.groupName?.slice(0, 2).toUpperCase() || "GC"}
          </AvatarFallback>
        </Avatar>
        <div className="overflow-hidden">
          <h3 className="text-sm font-semibold text-foreground truncate">{selectedChat?.groupName || "Group Chat"}</h3>
          <p className="text-[10px] text-muted-foreground truncate" title={membersListStr}>
            {truncateMessage(membersListStr, 40)}
          </p>
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
          {isAdmin ? (
            <>
              <DropdownMenuItem
                onClick={() => setOpenAddToGroup(true)}
                className="hover:bg-accent hover:text-foreground cursor-pointer text-xs flex gap-2 rounded-lg"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Add Members
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setOpenRemoveFromGroup(true)}
                className="hover:bg-accent hover:text-foreground cursor-pointer text-xs flex gap-2 rounded-lg"
              >
                <UserMinus className="h-3.5 w-3.5" />
                Remove Members
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem
              onClick={leaveGroup}
              className="hover:bg-accent cursor-pointer text-xs text-rose-500 hover:text-rose-600 flex gap-2 rounded-lg"
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
