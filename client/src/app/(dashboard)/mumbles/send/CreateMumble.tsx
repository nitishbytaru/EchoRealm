"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "@/hooks/use-toast";
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
    <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full relative p-4">
      <div className="w-full bg-card border border-border rounded-xl p-5 shadow-xl shadow-black/5 dark:shadow-black/30 space-y-5">
        
        <div className="text-center space-y-0.5">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Send a Mumble
          </h2>
          <p className="text-[10px] text-muted-foreground">Send an anonymous or public whisper to another user</p>
        </div>

        {/* Search section */}
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <Input
              type="text"
              placeholder="Search user by username..."
              value={search.value}
              onChange={search.changeHandler}
              className="pl-9 bg-background border-border focus-visible:ring-indigo-500 text-foreground placeholder:text-muted-foreground w-full rounded-lg h-9 text-xs"
            />
          </div>

          {search.value && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-popover border border-border rounded-lg shadow-2xl max-h-60 overflow-y-auto z-50 divide-y divide-border p-1">
              {searchResults?.length > 0 ? (
                searchResults.map((result) => {
                  const targetUser = result?.user;
                  if (!targetUser?.isAcceptingMumbles) return null;
                  return (
                    <div
                      key={targetUser._id}
                      onClick={() => router.push(`/mumbles/send/${targetUser._id}`)}
                      className="flex items-center gap-2.5 p-1.5 rounded-md hover:bg-accent cursor-pointer transition-colors"
                    >
                      <Avatar className="h-7 w-7 border border-border">
                        <AvatarImage src={targetUser?.avatar?.url} />
                        <AvatarFallback className="bg-muted text-indigo-400 text-[10px]">
                          {targetUser.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-semibold text-foreground">@{targetUser.username}</p>
                        <p className="text-[9px] text-indigo-400">Accepts whispers</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-3 text-center text-xs text-muted-foreground">
                  No user found with username &quot;{search.value}&quot;
                </div>
              )}
            </div>
          )}
        </div>

        {/* Selected User Display */}
        <div className="flex flex-col items-center justify-center min-h-[140px] py-4 bg-muted/30 border border-border rounded-xl">
          {selectedUser ? (
            <div className="flex flex-col items-center space-y-2 animate-in zoom-in-95 duration-200">
              <Avatar className="h-16 w-16 border border-indigo-500/30 shadow-md">
                <AvatarImage src={selectedUser?.avatar?.url} />
                <AvatarFallback className="bg-background text-indigo-400 text-sm">
                  {selectedUser.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h3 className="text-xs font-bold text-foreground">@{selectedUser.username}</h3>
                <p className="text-[9px] text-muted-foreground">Mumbling to this user</p>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-0.5">
              <p className="text-muted-foreground text-xs">No user selected</p>
              <p className="text-[9px] text-muted-foreground/70">Search above and select a profile</p>
            </div>
          )}
        </div>

        {/* Message Input bar */}
        <div className="flex items-center gap-2 bg-background rounded-lg border border-border p-1.5 relative">
          <Input
            type="text"
            className={`w-full bg-transparent border-none text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 pr-10 text-xs h-8.5 ${
              isOverLimit ? "text-red-400" : ""
            }`}
            placeholder={selectedUser ? `Whisper to @${selectedUser.username}...` : "Please select a user first..."}
            onChange={message.changeHandler}
            value={message.value}
            disabled={!selectedUser}
            onKeyDown={(e) => handleKeyPress(e, sendCurrentMumble)}
          />

          <div className="flex items-center gap-2.5">
            <span
              className={`text-[9px] font-mono ${
                isOverLimit ? "text-red-500 font-bold" : "text-muted-foreground"
              }`}
            >
              {message.value.length}/{CHARACTER_LIMIT}
            </span>

            <Button
              type="button"
              size="icon"
              onClick={sendCurrentMumble}
              disabled={isPending || isOverLimit || !selectedUser || !message.value}
              className="bg-indigo-650 hover:bg-indigo-600 text-zinc-50 rounded-lg h-8.5 w-8.5 flex-shrink-0"
            >
              {isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CreateMumble;
