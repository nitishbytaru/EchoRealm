"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { Search, Plus, X, Loader2 } from "lucide-react";

import { useInputValidation } from "@/hooks/useInputValidation";
import { updateMembersInGroupApi, searchEchoLinkFriendsApi } from "@/api/echo_link.api";
import { addToMyPrivateChatRooms } from "@/store/slices/echo_link.slice";
import { RootState } from "@/store/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AddToGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddToGroupDialog: React.FC<AddToGroupDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { selectedChat } = useSelector((state: RootState) => state.echoLink);

  const search = useInputValidation("");

  const [groupMembers, setGroupMembers] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (selectedChat?.groupChatRoomMembers) {
      // Map members to the format expected
      const initial = selectedChat.groupChatRoomMembers.map((m: any) => ({
        id: m._id || m.id,
        username: m.username,
      }));
      setGroupMembers(initial);
    }
  }, [selectedChat]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (search.value) {
        searchEchoLinkFriendsApi(search.value)
          .then((users) => {
            const filteredUsers = users.filter(
              (field: any) => field._id !== user?._id
            );
            setSearchResults(filteredUsers);
          })
          .catch((err) => console.error(err));
      } else {
        setSearchResults([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [search.value, user?._id]);

  function addGroupMember(selectedUser: any) {
    if (!groupMembers.some((member) => member.id === selectedUser.id)) {
      setGroupMembers((prev) => [...prev, selectedUser]);
    }
    search.clear();
  }

  function removeLocalGroupMember(id: string) {
    setGroupMembers((prev) => prev.filter((member) => member.id !== id));
  }

  const addMembersToGroup = async () => {
    const groupId = selectedChat?._id;
    if (!groupId) return;

    try {
      setIsPending(true);
      const response = await updateMembersInGroupApi({
        groupId,
        groupMembers,
      });
      dispatch(addToMyPrivateChatRooms(response?.data?.newGroupDetails));
      toast.success("Group members updated successfully");
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding group members:", error);
      toast.error("Failed to add group members. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-950 border-slate-800 text-white sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Add Members to {selectedChat?.groupName || "Group"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Search Users */}
          <div className="space-y-1.5 relative">
            <label className="text-xs font-semibold text-slate-400">Search users to add</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <Input
                type="text"
                placeholder="Search friends..."
                value={search.value}
                onChange={search.changeHandler}
                className="pl-9 bg-slate-900 border-slate-800 focus-visible:ring-indigo-500 text-white"
              />
            </div>

            {search.value && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl max-h-40 overflow-y-auto z-50 p-1 divide-y divide-slate-900">
                {searchResults?.length > 0 ? (
                  searchResults.map((searchUser) => (
                    <div
                      key={searchUser._id}
                      onClick={() =>
                        addGroupMember({
                          id: searchUser._id,
                          username: searchUser.username,
                        })
                      }
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-900 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={searchUser?.avatar?.url} />
                          <AvatarFallback className="bg-indigo-950 text-indigo-400 text-[10px]">
                            {searchUser.username.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium">@{searchUser.username}</span>
                      </div>
                      <Plus className="h-3.5 w-3.5 text-indigo-400" />
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-xs text-slate-500">No users found</div>
                )}
              </div>
            )}
          </div>

          {/* Current group members */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Selected Members ({groupMembers.length})</label>
            <div className="flex flex-wrap gap-1.5 p-2 bg-slate-900/30 border border-slate-900 rounded-xl max-h-40 overflow-y-auto">
              {groupMembers.map((member) => (
                <span
                  key={member.id}
                  className="inline-flex items-center gap-1 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-medium px-2 py-0.5 rounded-full"
                >
                  @{member.username}
                  <button
                    type="button"
                    onClick={() => removeLocalGroupMember(member.id)}
                    className="text-indigo-400 hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
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
            onClick={addMembersToGroup}
            disabled={isPending || groupMembers.length === 0}
            className="bg-indigo-500 hover:bg-indigo-600 text-white text-xs px-4"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
            ) : null}
            Update Members
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddToGroupDialog;
