"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
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
      <DialogContent className="bg-slate-950 border-slate-800 text-white sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Remove Members from {selectedChat?.groupName || "Group"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <p className="text-xs text-slate-400">Click &apos;X&apos; next to the member you wish to remove, then update.</p>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Group Members ({groupMembers.length})</label>
            <div className="bg-slate-900/30 border border-slate-900 rounded-xl max-h-60 overflow-y-auto p-2 space-y-1.5">
              {groupMembers.map((member) => (
                <div
                  key={member._id}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-900"
                >
                  <span className="text-xs font-medium text-slate-200">@{member.username}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeGroupMember(member)}
                    className="h-7 w-7 text-rose-450 hover:text-rose-450 hover:bg-rose-500/10 rounded-full"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              {groupMembers.length === 0 && (
                <div className="text-center p-4 text-xs text-slate-500">No members selected</div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <DialogClose render={
            <Button variant="ghost" className="hover:bg-slate-900 text-slate-400 hover:text-white text-xs">
              Cancel
            </Button>
          } />
          <Button
            onClick={removeMemberFromGroup}
            disabled={isPending || groupMembers.length === 0}
            className="bg-indigo-500 hover:bg-indigo-600 text-white text-xs px-4"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
            ) : null}
            Update Group
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RemoveFromGroupDialog;
