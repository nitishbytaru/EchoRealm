"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Send, Search, Loader2 } from "lucide-react";

import { sendMumbleApi } from "@/api/echo_mumble.api";
import { searchUserByIdApi } from "@/api/user.api";
import { handleKeyPress } from "@/utils/helpers/micro_funcs";
import { useDebouncedSearchResults } from "@/hooks/useDebouncedSearchResults";
import { useInputValidation } from "@/hooks/useInputValidation";
import { RootState } from "@/store/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CreateMumbleProps {
  mumbleTo?: string;
}

export const CreateMumble: React.FC<CreateMumbleProps> = ({ mumbleTo }) => {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const search = useInputValidation("");
  const message = useInputValidation("");
  const searchResults = useDebouncedSearchResults(search.value);

  const [isPending, setIsPending] = useState(false);

  const searchUserByIdFunc = async () => {
    if (!mumbleTo) return;

    try {
      setIsPending(true);
      const response = await searchUserByIdApi(mumbleTo);
      setSelectedUser(response?.data?.searchedUser);
      search.clear();
    } catch (error) {
      console.error("Error fetching user:", error);
      toast.error("Failed to fetch user data.");
    } finally {
      setIsPending(false);
    }
  };

  const sendCurrentMumble = async () => {
    if (!selectedUser) {
      toast.error("Please select a user to send a Mumble");
      return;
    }

    if (!message.value) {
      toast.error("Enter a message to send a Mumble");
      return;
    }

    const data = {
      message: message.value,
      receiver: selectedUser._id,
      sender: user?.username || null,
    };

    try {
      setIsPending(true);
      const response = await sendMumbleApi(data);
      toast.success(response?.data?.message || "Mumble sent successfully!");
      message.clear();
      setSelectedUser(null);
      router.push("/mumbles/send");
    } catch (error) {
      console.error("Error sending mumble:", error);
      toast.error("Failed to send Mumble. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  useEffect(() => {
    if (mumbleTo) {
      searchUserByIdFunc();
    }
  }, [mumbleTo]);

  const CHARACTER_LIMIT = 55;
  const isOverLimit = message.value.length > CHARACTER_LIMIT;

  return (
    <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full relative p-4">
      <div className="w-full bg-slate-900/40 border border-slate-900 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
        
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Send a Mumble
          </h2>
          <p className="text-xs text-slate-400">Send an anonymous or public whisper to another user</p>
        </div>

        {/* Search section */}
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              type="text"
              placeholder="Search user by username..."
              value={search.value}
              onChange={search.changeHandler}
              className="pl-10 bg-slate-950 border-slate-800 focus-visible:ring-indigo-500 text-white w-full rounded-2xl h-11"
            />
          </div>

          {search.value && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl max-h-60 overflow-y-auto z-50 divide-y divide-slate-900 p-1.5">
              {searchResults?.length > 0 ? (
                searchResults.map((result) => {
                  const targetUser = result?.user;
                  if (!targetUser?.isAcceptingMumbles) return null;
                  return (
                    <div
                      key={targetUser._id}
                      onClick={() => router.push(`/mumbles/send/${targetUser._id}`)}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-900 cursor-pointer transition-colors"
                    >
                      <Avatar className="h-9 w-9 border border-indigo-500/30">
                        <AvatarImage src={targetUser?.avatar?.url} />
                        <AvatarFallback className="bg-indigo-950 text-indigo-400 text-xs">
                          {targetUser.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-semibold text-white">@{targetUser.username}</p>
                        <p className="text-[10px] text-indigo-400">Accepts whispers</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 text-center text-xs text-slate-500">
                  No user found with username &quot;{search.value}&quot;
                </div>
              )}
            </div>
          )}
        </div>

        {/* Selected User Display */}
        <div className="flex-1 flex flex-col items-center justify-center min-h-[160px] py-4 bg-slate-950/40 border border-slate-900/60 rounded-2xl">
          {selectedUser ? (
            <div className="flex flex-col items-center space-y-3 animate-in zoom-in-95 duration-200">
              <Avatar className="h-20 w-20 border-2 border-indigo-500/50 shadow-lg">
                <AvatarImage src={selectedUser?.avatar?.url} />
                <AvatarFallback className="bg-indigo-900 text-lg">
                  {selectedUser.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h3 className="text-lg font-bold text-white">@{selectedUser.username}</h3>
                <p className="text-[10px] text-slate-500">Mumbling to this user</p>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-1">
              <p className="text-slate-500 text-sm">No user selected</p>
              <p className="text-[10px] text-slate-600">Search above and select a profile</p>
            </div>
          )}
        </div>

        {/* Message Input bar */}
        <div className="flex items-center gap-2 bg-slate-950/80 rounded-2xl border border-slate-900 p-2 relative">
          <Input
            type="text"
            className={`w-full bg-transparent border-none text-white placeholder:text-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0 pr-10 ${
              isOverLimit ? "text-red-400" : ""
            }`}
            placeholder={selectedUser ? `Whisper to @${selectedUser.username}...` : "Please select a user first..."}
            onChange={message.changeHandler}
            value={message.value}
            disabled={!selectedUser}
            onKeyDown={(e) => handleKeyPress(e, sendCurrentMumble)}
          />

          <div className="flex items-center gap-3">
            <span
              className={`text-[10px] font-mono ${
                isOverLimit ? "text-red-500 font-bold" : "text-slate-500"
              }`}
            >
              {message.value.length}/{CHARACTER_LIMIT}
            </span>

            <Button
              type="button"
              size="icon"
              onClick={sendCurrentMumble}
              disabled={isPending || isOverLimit || !selectedUser || !message.value}
              className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl h-9 w-9 flex-shrink-0"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CreateMumble;
