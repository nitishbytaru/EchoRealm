"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Send, Search, User as UserIcon, AtSign, PenLine, Check, HatGlasses, type LucideIcon } from "lucide-react";

import { sendMumbleApi } from "@/api/echo_mumble.api";
import { searchUserByIdApi } from "@/api/user.api";
import { handleKeyPress } from "@/utils/helpers/micro_funcs";
import { useDebouncedSearchResults } from "@/hooks/useDebouncedSearchResults";
import { useInputValidation } from "@/hooks/useInputValidation";
import { RootState } from "@/store/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PageHeader from "@/components/PageHeader";
import Handle from "@/components/Handle";
import { cn } from "@/lib/utils";
import MumbleNote from "../components/MumbleNote";

interface CreateMumbleProps {
  mumbleTo?: string;
}

const CHARACTER_LIMIT = 55;

/** Small labeled icon tile that heads each part of the form. */
function SectionLabel({ icon: Icon, label, fill, htmlFor }: { icon: LucideIcon; label: string; fill: string; htmlFor?: string }) {
  const content = (
    <>
      <span className={cn("flex size-7 items-center justify-center rounded-lg border-[2px] border-[var(--nb-border-color)] text-on-color", fill)}>
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <span className="text-sm font-extrabold uppercase tracking-wide text-foreground">{label}</span>
    </>
  );
  return htmlFor ? (
    <label htmlFor={htmlFor} className="flex w-fit items-center gap-2">
      {content}
    </label>
  ) : (
    <span className="flex w-fit items-center gap-2">{content}</span>
  );
}

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
    { value: false, title: `As @${user?.username ?? "you"}`, hint: "They'll see it's from you" },
    { value: true, title: "Anonymous", hint: "No name, can't be traced" },
  ];

  return (
    <div className="flex w-full flex-col gap-6">
      <PageHeader as="h2" title="Send a" sticker="Mumble" stickerFill="bg-nb-accent" description="A short, quiet note for one person. Up to 55 characters." />

      <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_19rem]">
      <div className="overflow-visible rounded-2xl border-2 border-[var(--nb-border-color)] bg-card shadow-[var(--nb-shadow)]">
        {/* To */}
        <section className="relative p-5 sm:p-6">
          <SectionLabel icon={AtSign} label="To" fill="bg-secondary" htmlFor={selectedUser ? undefined : "mumble-recipient"} />
          {selectedUser ? (
            <div className="nb-sticker-in mt-3 flex items-center gap-3 rounded-2xl border-2 border-[var(--nb-border-color)] bg-muted/60 p-3 shadow-[var(--nb-shadow-sm)]" style={{ ["--tilt" as string]: "-0.6deg" }}>
              <Avatar className="size-12 border-2">
                <AvatarImage src={selectedUser?.avatar?.url} alt="" className="object-cover" />
                <AvatarFallback className="bg-secondary text-base font-extrabold text-on-color">
                  {selectedUser.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <Handle name={selectedUser.username} className="max-w-full text-base" />
                <p className="text-xs font-semibold text-muted-foreground">Takes Mumbles</p>
              </div>
              <Button
                variant="outline"
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
            <div className="relative mt-3">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                id="mumble-recipient"
                type="text"
                placeholder="Search for someone by username"
                value={search.value}
                onChange={search.changeHandler}
                className="h-12 w-full pl-11 text-base"
              />
              {search.value && (
                <ul className="absolute top-full right-0 left-0 z-50 mt-2 max-h-64 space-y-1 overflow-y-auto rounded-xl border-2 border-[var(--nb-border-color)] bg-popover p-1.5 shadow-[var(--nb-shadow)]">
                  {recipients.length > 0 ? (
                    recipients.map((candidate: any) => (
                      <li key={candidate._id}>
                        <button
                          type="button"
                          onClick={() => {
                            search.clear();
                            setSelectedUser(candidate);
                          }}
                          className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-primary/25"
                        >
                          <Avatar className="size-9">
                            <AvatarImage src={candidate?.avatar?.url} alt="" />
                            <AvatarFallback className="bg-secondary text-xs font-bold text-on-color">
                              {candidate.username.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <Handle name={candidate.username} />
                        </button>
                      </li>
                    ))
                  ) : (
                    <li className="p-3 text-center text-sm font-medium text-muted-foreground">
                      Nobody with that name is taking Mumbles.
                    </li>
                  )}
                </ul>
              )}
            </div>
          )}
        </section>

        <hr className="mx-5 border-0 border-t-2 border-dashed border-[var(--nb-line)] sm:mx-6" />

        {/* From */}
        <fieldset className="p-5 sm:p-6">
          <legend className="contents">
            <SectionLabel icon={UserIcon} label="From" fill="bg-primary" />
          </legend>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {identityOptions.map(({ value, title, hint }) => {
              const selected = isAnonymous === value;
              return (
                <label
                  key={String(value)}
                  className={cn(
                    "relative flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-3 transition-[rotate,background-color,box-shadow] duration-200 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-foreground",
                    selected
                      ? "border-[var(--nb-border-color)] bg-nb-accent text-on-color shadow-[var(--nb-shadow-sm)]"
                      : cn("border-dashed border-[var(--nb-border-color)]/50 bg-card text-foreground hover:bg-muted", value ? "rotate-[0.6deg]" : "-rotate-[0.6deg]")
                  )}
                >
                  <input
                    type="radio"
                    name="mumble-identity"
                    checked={selected}
                    onChange={() => setIsAnonymous(value)}
                    className="sr-only"
                  />
                  {value ? (
                    <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-[var(--nb-border-color)]", selected ? "bg-card text-foreground" : "bg-nb-accent text-on-color")}>
                      <HatGlasses className="size-5" aria-hidden="true" />
                    </span>
                  ) : (
                    <Avatar className="size-11 border-2">
                      <AvatarImage src={user?.avatar?.url} alt="" className="object-cover" />
                      <AvatarFallback className="bg-primary text-sm font-extrabold text-on-color">
                        {user?.username?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-extrabold">{title}</span>
                    <span className={cn("block text-xs font-semibold", selected ? "text-on-color/75" : "text-muted-foreground")}>{hint}</span>
                  </span>
                  {selected && (
                    <span aria-hidden="true" className="nb-older-in absolute -top-2.5 -right-2.5 flex size-7 rotate-6 items-center justify-center rounded-lg border-[2px] border-[var(--nb-border-color)] bg-primary text-on-color shadow-[2px_2px_0_var(--nb-shadow-color)]">
                      <Check className="size-4" strokeWidth={3} />
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </fieldset>

        <hr className="mx-5 border-0 border-t-2 border-dashed border-[var(--nb-line)] sm:mx-6" />

        {/* Note */}
        <section className={cn("p-5 sm:p-6", !selectedUser && "opacity-60")}>
          <SectionLabel icon={PenLine} label="Note" fill="bg-nb-accent" htmlFor="mumble-message" />
          <textarea
            id="mumble-message"
            rows={3}
            aria-invalid={isOverLimit || undefined}
            aria-describedby="mumble-count"
            className="nb-ruled nb-note-input mt-3 block w-full resize-none rounded-2xl border-2 border-[var(--nb-border-color)] bg-card px-4 py-2 text-lg font-bold leading-7 text-foreground placeholder:font-semibold placeholder:text-muted-foreground disabled:cursor-not-allowed"
            placeholder={selectedUser ? `Something nice for @${selectedUser.username}…` : "Pick who it's for first"}
            onChange={(e) => message.setValue(e.target.value)}
            value={message.value}
            disabled={!selectedUser}
            onKeyDown={(e) => handleKeyPress(e, sendCurrentMumble)}
          />

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div id="mumble-count" className="flex min-w-0 flex-1 items-center gap-3">
              <div className="h-3 flex-1 overflow-hidden rounded-full border-[2px] border-[var(--nb-border-color)] bg-muted">
                <div
                  className={cn("h-full rounded-full transition-[width,background-color] duration-200", isOverLimit ? "bg-destructive" : "bg-nb-accent")}
                  style={{ width: `${Math.min(100, (message.value.length / CHARACTER_LIMIT) * 100)}%` }}
                />
              </div>
              <span className={cn("shrink-0 font-mono text-xs font-bold", isOverLimit ? "text-nb-danger-text" : "text-muted-foreground")}>
                {message.value.length}/{CHARACTER_LIMIT}
              </span>
            </div>
            <Button
              type="button"
              size="lg"
              onClick={sendCurrentMumble}
              disabled={!canSend}
              loading={isPending}
              className="bg-nb-accent text-on-color sm:w-auto"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
              Send Mumble
            </Button>
          </div>
        </section>
      </div>

      {/* Live preview */}
      <section aria-label="Preview" className="xl:sticky xl:top-24">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Preview</p>
        <MumbleNote
          message={message.value}
          sender={isAnonymous ? null : user?.username ?? "you"}
          isUnread
          index={0}
          placeholder="Start typing to see your note"
        />
        <p className="mt-4 text-sm font-medium text-muted-foreground">
          {selectedUser ? `This is how it will land in @${selectedUser.username}'s inbox.` : "Pick someone to send it to."}
        </p>
      </section>
      </div>
    </div>
  );
};

export default CreateMumble;
