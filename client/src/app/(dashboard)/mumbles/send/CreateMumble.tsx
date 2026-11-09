"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Send, Search, EyeOff, User as UserIcon } from "lucide-react";

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

const CHARACTER_LIMIT = 55;

export const CreateMumble: React.FC<CreateMumbleProps> = ({ mumbleTo }) => {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isAnonymous, setIsAnonymous] = useState(Boolean(user?.isAnonymous));
  const [isPending, setIsPending] = useState(false);
  const search = useInputValidation("");
  const message = useInputValidation("");
  const searchResults = useDebouncedSearchResults(search.value);

  const recipients = (searchResults || [])
    .map((result: any) => result?.user)
    .filter((candidate: any) => candidate?.isAcceptingMumbles);

  useEffect(() => {
    setIsAnonymous(Boolean(user?.isAnonymous));
  }, [user?.isAnonymous]);

  useEffect(() => {
    if (!mumbleTo) return;
    (async () => {
      try {
        setIsPending(true);
        const response = await searchUserByIdApi(mumbleTo);
        setSelectedUser(response?.data?.searchedUser);
        search.clear();
      } catch (error) {
        console.error("Error fetching user:", error);
        toast.error("We couldn't load that person. Search for them instead.");
      } finally {
        setIsPending(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mumbleTo]);

  const isOverLimit = message.value.length > CHARACTER_LIMIT;
  const canSend = !isPending && !isOverLimit && Boolean(selectedUser) && message.value.trim().length > 0;

  const sendCurrentMumble = async () => {
    if (!canSend) return;
    try {
      setIsPending(true);
      await sendMumbleApi({ message: message.value, receiver: selectedUser._id, isAnonymous });
      toast.success(isAnonymous ? "Mumble sent anonymously." : "Mumble sent.");
      message.clear();
      setSelectedUser(null);
      router.push("/mumbles/send");
    } catch (error) {
      console.error("Error sending mumble:", error);
      toast.error("That Mumble didn't send. It's still here, so you can try again.");
    } finally {
      setIsPending(false);
    }
  };

  const identityOptions = [
    { value: false, label: `@${user?.username ?? "you"}`, icon: UserIcon },
    { value: true, label: "Anonymous", icon: EyeOff },
  ];

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 py-6">
      <div>
        <h1 className="text-lg font-bold text-foreground">Send a Mumble</h1>
        <p className="text-sm font-medium text-muted-foreground">A short, quiet note for one person.</p>
      </div>

      <div className="relative">
        {selectedUser ? (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={selectedUser?.avatar?.url} alt="" />
              <AvatarFallback className="bg-nb-accent text-sm text-on-color">
                {selectedUser.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <p className="min-w-0 flex-1 truncate text-sm font-bold text-foreground">To @{selectedUser.username}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedUser(null);
                if (mumbleTo) router.push("/mumbles/send");
              }}
            >
              Change
            </Button>
          </div>
        ) : (
          <>
            <label htmlFor="mumble-recipient" className="mb-2 block text-sm font-bold text-foreground">
              Who is it for?
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                id="mumble-recipient"
                type="text"
                placeholder="Search by username"
                value={search.value}
                onChange={search.changeHandler}
                className="w-full pl-9 text-base md:text-sm"
              />
            </div>
            {search.value && (
              <ul className="absolute top-full right-0 left-0 z-50 mt-2 max-h-60 space-y-1 overflow-y-auto rounded-xl border-[3px] border-[var(--nb-border-color)] bg-popover p-1 shadow-[var(--nb-shadow-sm)]">
                {recipients.length > 0 ? (
                  recipients.map((candidate: any) => (
                    <li key={candidate._id}>
                      <button
                        type="button"
                        onClick={() => {
                          search.clear();
                          setSelectedUser(candidate);
                        }}
                        className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-muted"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={candidate?.avatar?.url} alt="" />
                          <AvatarFallback className="bg-nb-accent text-xs text-on-color">
                            {candidate.username.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="min-w-0 truncate text-sm font-bold text-foreground">@{candidate.username}</span>
                      </button>
                    </li>
                  ))
                ) : (
                  <li className="p-3 text-center text-sm font-medium text-muted-foreground">
                    Nobody with that name is accepting Mumbles.
                  </li>
                )}
              </ul>
            )}
          </>
        )}
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-bold text-foreground">Send as</legend>
        <div className="grid grid-cols-2 gap-2">
          {identityOptions.map(({ value, label, icon: Icon }) => (
            <label
              key={label}
              className={`flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border-[3px] px-2 text-sm font-bold has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-foreground ${
                isAnonymous === value
                  ? "border-[var(--nb-border-color)] bg-nb-accent text-on-color"
                  : "border-dashed border-muted-foreground text-muted-foreground hover:text-foreground"
              }`}
            >
              <input
                type="radio"
                name="mumble-identity"
                checked={isAnonymous === value}
                onChange={() => setIsAnonymous(value)}
                className="sr-only"
              />
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="min-w-0 truncate">{label}</span>
            </label>
          ))}
        </div>
        <p className="mt-2 text-sm font-medium text-muted-foreground">
          {isAnonymous
            ? "They won't see who sent this, and it can't be traced back to you."
            : "They'll see your username on this Mumble."}
        </p>
      </fieldset>

      <div>
        <label htmlFor="mumble-message" className="sr-only">
          Your Mumble
        </label>
        <div className="flex items-center gap-2">
          <div className="relative min-w-0 grow">
            <Input
              id="mumble-message"
              type="text"
              aria-invalid={isOverLimit || undefined}
              className="w-full border-dashed pr-14 text-base md:text-sm"
              placeholder={selectedUser ? `Mumble to @${selectedUser.username}` : "Choose someone first"}
              onChange={message.changeHandler}
              value={message.value}
              disabled={!selectedUser}
              onKeyDown={(e) => handleKeyPress(e, sendCurrentMumble)}
            />
            <span className={`absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs font-bold ${isOverLimit ? "text-nb-danger-text" : "text-muted-foreground"}`}>
              {message.value.length}/{CHARACTER_LIMIT}
            </span>
          </div>
          <Button
            type="button"
            size="icon-lg"
            onClick={sendCurrentMumble}
            disabled={!canSend}
            loading={isPending}
            aria-label="Send Mumble"
            className="shrink-0 rounded-xl bg-nb-accent text-on-color"
          >
            {!isPending && <Send className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateMumble;
