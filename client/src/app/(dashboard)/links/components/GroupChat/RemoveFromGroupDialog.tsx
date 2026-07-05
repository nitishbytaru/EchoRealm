"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "@/hooks/use-toast";
import { Trash2, Loader2, X } from "lucide-react";

import { updateMembersInGroupApi } from "@/api/echo_link.api";
import { addToMyPrivateChatRooms } from "@/store/slices/echo_link.slice";
import { RootState } from "@/store/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface RemoveFromGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RemoveFromGroupDialog: React.FC<RemoveFromGroupDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const dispatch = useDispatch();
  const { selectedChat } = useSelector((state: RootState) => state.echoLink);

  const [groupMembers, setGroupMembers] = useState<any[]>([]);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (selectedChat?.groupChatRoomMembers) {
      setGroupMembers(selectedChat.groupChatRoomMembers);
    }
  }, [selectedChat]);

  function removeGroupMember(userToRemove: any) {
    setGroupMembers((prevMembers) =>
      prevMembers.filter((member) => member._id !== userToRemove._id)
    );
  }

  const removeMemberFromGroup = async () => {
    const groupId = selectedChat?._id;
    if (!groupId) return;

    try {
      setIsPending(true);
      const response = await updateMembersInGroupApi({
        groupId,
        groupMembers: groupMembers.map((m) => ({ id: m._id, username: m.username })),
      });
      dispatch(addToMyPrivateChatRooms(response?.data?.newGroupDetails));
      toast.success("Group members updated successfully");
      onOpenChange(false);
    } catch (error) {
      console.error("Error removing from group:", error);
      toast.error("Failed to update group members. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-popover border-border text-popover-foreground sm:max-w-md max-h-[90vh] overflow-y-auto rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold text-foreground">
            Remove Members from {selectedChat?.groupName || "Group"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <p className="text-[10px] text-muted-foreground">Click &apos;X&apos; next to the member you wish to remove, then update.</p>

          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Group Members ({groupMembers.length})</label>
            <div className="bg-muted border border-border rounded-xl max-h-60 overflow-y-auto p-2 space-y-1.5">
              {groupMembers.map((member) => (
                <div
                  key={member._id}
                  className="flex items-center justify-between p-2 rounded-lg bg-background border border-border"
                >
                  <span className="text-xs font-medium text-foreground">@{member.username}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeGroupMember(member)}
                    className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-full tap-interactive"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              {groupMembers.length === 0 && (
                <div className="text-center p-4 text-xs text-muted-foreground">No members selected</div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <DialogClose render={
            <Button variant="ghost" className="hover:bg-accent text-muted-foreground hover:text-foreground text-xs rounded-lg h-9 tap-interactive">
              Cancel
            </Button>
          } />
          <Button
            onClick={removeMemberFromGroup}
            loading={isPending}
            disabled={groupMembers.length === 0}
            className="bg-indigo-650 hover:bg-indigo-600 text-white text-xs px-4 rounded-lg shadow-sm shadow-indigo-950/20 h-9 tap-interactive"
          >
            Update Group
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RemoveFromGroupDialog;
