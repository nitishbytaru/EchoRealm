"use client";

import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { ChevronLeft, MoreVertical, LogOut, UserPlus, UserMinus } from "lucide-react";
import Link from "next/link";

import { leaveFromGroupChatApi } from "@/api/echo_link.api";
import { truncateMessage } from "@/utils/helpers/micro_funcs";
import { RootState } from "@/store/store";
import ConfirmDialog from "@/components/ConfirmDialog";
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

  const [confirmLeave, setConfirmLeave] = useState(false);

  const leaveGroup = async () => {
    if (!selectedChat?._id) return;
    try {
      setIsPendingOperation(true);
      await leaveFromGroupChatApi(selectedChat._id);
      toast.success("You left the group.");
      router.push("/links");
    } catch (error) {
      console.error("Error leaving group:", error);
      toast.error("We couldn't remove you from this group. Please try again.");
    } finally {
      setIsPendingOperation(false);
    }
  };

  const isAdmin = selectedChat?.admin?._id === user?._id || selectedChat?.admin === user?._id;

  const membersListStr = selectedChat?.groupChatRoomMembers
    ?.map((member: any) => member.username)
    .join(", ") || "";

  return (
    <div className="flex shrink-0 items-center justify-between gap-3 border-b-[3px] border-[var(--nb-border-color)] bg-card px-4 py-3">
      <div className="flex items-center space-x-3 max-w-[70%]">
        {/* Back button for mobile view */}
        <Link href="/links" aria-label="Back to chats" className="md:hidden flex size-11 items-center justify-center text-muted-foreground hover:text-foreground transition-colors tap-interactive">
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
          <Button variant="outline" size="icon" aria-label="Group options" className="tap-interactive">
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
            <DropdownMenuItem onClick={() => setConfirmLeave(true)} variant="destructive">
              <LogOut className="h-4 w-4" />
              Leave Group
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={confirmLeave}
        onOpenChange={setConfirmLeave}
        title={`Leave ${selectedChat?.groupName ?? "this group"}?`}
        description="You'll stop getting its messages. Only the group admin can add you back."
        confirmLabel="Leave group"
        onConfirm={leaveGroup}
      />
    </div>
  );
};

export default GroupChatNav;
