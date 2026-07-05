"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { Search, Plus, X, Loader2 } from "lucide-react";

import { useFileHandler } from "@/hooks/useFileHandler";
import { useInputValidation } from "@/hooks/useInputValidation";
import { createGroupChatApi, searchEchoLinkFriendsApi } from "@/api/echo_link.api";
import { addToMyPrivateChatRooms } from "@/store/slices/echo_link.slice";
import { RootState } from "@/store/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isGroupPending: boolean;
  startTransitionGroup: (val: boolean) => void;
}

export const CreateGroupDialog: React.FC<CreateGroupDialogProps> = ({
  open,
  onOpenChange,
  isGroupPending,
  startTransitionGroup,
}) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const groupName = useInputValidation("");
  const groupProfile = useFileHandler("single");
  const search = useInputValidation("");

  const [groupMembers, setGroupMembers] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);

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

  const createNewGroup = async () => {
    if (!groupName.value) {
      toast.error("Please enter a group name");
      return;
    }
    if (groupMembers.length === 0) {
      toast.error("Please select at least one group member");
      return;
    }

    const formData = new FormData();
    formData.append("groupName", groupName.value);
    if (groupProfile.file) {
      formData.append("groupProfilePicture", groupProfile.file);
    }
    formData.append("groupMembers", JSON.stringify(groupMembers));

    try {
      startTransitionGroup(true);
      const response = await createGroupChatApi(formData);
      dispatch(addToMyPrivateChatRooms(response?.data?.newGroupDetails));
      toast.success("Group Created successfully!");
      setGroupMembers([]);
      groupName.clear();
      groupProfile.clear();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error("Failed to create group. Please try again.");
    } finally {
      startTransitionGroup(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-950 border-slate-800 text-white sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Create a New Group
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Group Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Group Name</label>
            <Input
              type="text"
              placeholder="Enter group name"
              value={groupName.value}
              onChange={groupName.changeHandler}
              className="bg-slate-900 border-slate-800 focus-visible:ring-indigo-500 text-white"
            />
          </div>

          {/* Group Profile Photo */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Group Profile Picture</label>
            <Input
              type="file"
              accept="image/*"
              onChange={groupProfile.changeHandler}
              className="bg-slate-900 border-slate-800 text-slate-300 text-xs file:bg-slate-800 file:border-none file:text-white file:text-xs file:px-2.5 file:py-1 file:rounded-md file:mr-3 cursor-pointer"
            />
          </div>

          {/* Search friends */}
          <div className="space-y-1.5 relative">
            <label className="text-xs font-semibold text-slate-400">Add Group Members</label>
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
          {groupMembers.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Selected Members ({groupMembers.length})</label>
              <div className="flex flex-wrap gap-1.5 p-2 bg-slate-900/30 border border-slate-900 rounded-xl max-h-24 overflow-y-auto">
                {groupMembers.map((member) => (
                  <span
                    key={member.id}
                    className="inline-flex items-center gap-1 bg-indigo-500/20 border border-indigo-500/30 text-indigo-305 text-[10px] font-medium px-2 py-0.5 rounded-full"
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
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <DialogClose render={
            <Button variant="ghost" className="hover:bg-slate-900 text-slate-400 hover:text-white text-xs">
              Cancel
            </Button>
          } />
          <Button
            onClick={createNewGroup}
            disabled={isGroupPending || !groupName.value || groupMembers.length === 0}
            className="bg-indigo-500 hover:bg-indigo-600 text-white text-xs px-4"
          >
            {isGroupPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
            ) : null}
            Create Group
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupDialog;
