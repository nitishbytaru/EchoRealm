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
    <div className="flex items-center justify-between p-3 rounded-2xl bg-card border-[3px] border-[var(--nb-border-color)] shadow-[var(--nb-shadow-sm)]">
      <div className="flex items-center space-x-3 max-w-[70%]">
        {/* Back button for mobile view */}
        <Link href="/links" className="md:hidden p-1 text-muted-foreground hover:text-foreground transition-colors tap-interactive">
          <ChevronLeft className="h-6 w-6" />
        </Link>

        <Avatar className="h-10 w-10">
          <AvatarImage src={selectedChat?.groupProfile?.url} />
          <AvatarFallback className="bg-secondary text-secondary-foreground text-sm font-bold">
            {selectedChat?.groupName?.slice(0, 2).toUpperCase() || "GC"}
          </AvatarFallback>
        </Avatar>
        <div className="overflow-hidden">
          <h3 className="text-sm font-bold text-foreground truncate">{selectedChat?.groupName || "Group Chat"}</h3>
          <p className="text-xs text-muted-foreground truncate font-medium" title={membersListStr}>
            {truncateMessage(membersListStr, 40)}
          </p>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger render={
          <Button variant="outline" size="icon-sm" className="tap-interactive">
            <MoreVertical className="h-4 w-4" />
          </Button>
        } />
        <DropdownMenuContent className="w-48">
          {isAdmin ? (
            <>
              <DropdownMenuItem onClick={() => setOpenAddToGroup(true)}>
                <UserPlus className="h-4 w-4" />
                Add Members
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setOpenRemoveFromGroup(true)}>
                <UserMinus className="h-4 w-4" />
                Remove Members
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem onClick={leaveGroup} variant="destructive">
              <LogOut className="h-4 w-4" />
              Leave Group
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default GroupChatNav;
