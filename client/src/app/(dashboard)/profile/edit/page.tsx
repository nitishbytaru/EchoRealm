"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { Camera, Mail, User as UserIcon, Lock, Save, Eye, HatGlasses, Mailbox, MessageCircleOff, Check, X, RotateCcw, ImageUp } from "lucide-react";

import { updateRequestApi } from "@/api/user.api";
import { useFileHandler } from "@/hooks/useFileHandler";
import { useInputValidation } from "@/hooks/useInputValidation";
import { setUser } from "@/store/slices/auth.slice";
import { RootState } from "@/store/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/PageHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import StickerSwitch from "@/components/StickerSwitch";
import { Sparkle, TypingBubble } from "@/components/brand/BrandMarks";
import { cn } from "@/lib/utils";

export default function MyProfileDetailsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);

  const avatar = useFileHandler("single");
  const updatedEmail = useInputValidation(user?.email || "");
  const updatedUsername = useInputValidation(user?.username || "");
  const updatedPassword = useInputValidation("");

  const [udatedIsAcceptingMumbles, setUpdatedIsAcceptingMumbles] = useState(
    user?.isAcceptingMumbles || false
  );
  const [updatedIsAnonymous, setUpdatedIsAnonymous] = useState(
    user?.isAnonymous || false
  );

  const [isPending, setIsPending] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Sync initial state if user details load late
  useEffect(() => {
    if (user) {
      if (updatedEmail.value === "") updatedEmail.setValue(user.email || "");
      if (updatedUsername.value === "") updatedUsername.setValue(user.username || "");
      setUpdatedIsAcceptingMumbles(user.isAcceptingMumbles || false);
      setUpdatedIsAnonymous(user.isAnonymous || false);
    }
  }, [user]);

  // Handle avatar local preview
  useEffect(() => {
    if (avatar.file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(avatar.file);
    } else {
      setAvatarPreview(null);
    }
  }, [avatar.file]);

  const isDirty =
    Boolean(avatar.file) ||
    updatedPassword.value !== "" ||
    updatedEmail.value !== (user?.email || "") ||
    updatedUsername.value !== (user?.username || "") ||
    udatedIsAcceptingMumbles !== Boolean(user?.isAcceptingMumbles) ||
    updatedIsAnonymous !== Boolean(user?.isAnonymous);

  const discardChanges = () => {
    avatar.clear();
    updatedPassword.clear();
    updatedEmail.setValue(user?.email || "");
    updatedUsername.setValue(user?.username || "");
    setUpdatedIsAcceptingMumbles(Boolean(user?.isAcceptingMumbles));
    setUpdatedIsAnonymous(Boolean(user?.isAnonymous));
  };

  const initials = (updatedUsername.value || user?.username || "me").slice(0, 2).toUpperCase();
  const handle = updatedUsername.value || user?.username || "you";

  const submitUpdateRequest = async () => {
    if (updatedEmail.value === "" || updatedUsername.value === "") {
      toast.error("Please fill in all required fields.");
      return;
    }

    const formData = new FormData();
    formData.append("updatedEmail", updatedEmail.value);
    formData.append("updatedUsername", updatedUsername.value);
    formData.append("updatedPassword", updatedPassword.value);
    formData.append("updatedIsAcceptingMumbles", String(udatedIsAcceptingMumbles));
    formData.append("updatedIsAnonymous", String(updatedIsAnonymous));
    if (avatar.file) {
      formData.append("avatar", avatar.file);
    }

    try {
      setIsPending(true);
      const response = await updateRequestApi(formData);
      if (response?.data) {
        dispatch(setUser(response.data.user));
        toast.success(response.data.message || "Profile updated successfully!");
        updatedPassword.clear();
        router.push("/profile/edit");
      } else {
        toast.error("Failed to update the profile details.");
      }
    } catch (error) {
      console.error("Error submitting update request:", error);
      toast.error("An error occurred while updating profile.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="nb-stagger space-y-6 [--nb-stagger-start:150ms]">
      <PageHeader as="h2" title="Profile" sticker="details" stickerFill="bg-primary" description="Your picture, how people find you, and how you show up." />

      <div className="nb-stagger grid items-start gap-6 lg:grid-cols-[18rem_minmax(0,1fr)] xl:gap-8 [--nb-stagger-start:220ms]">
        {/* Photo: a polaroid on the purple panel */}
        <section aria-label="Profile picture" className="relative overflow-hidden rounded-2xl border-2 border-[var(--nb-border-color)] bg-nb-accent p-6 shadow-[var(--nb-shadow-sm)] lg:sticky lg:top-24">
          <div aria-hidden="true" className="nb-dotgrid absolute inset-0 opacity-70 [mask-image:none]" />
          <Sparkle className="absolute top-4 left-4 w-6" />
          <Sparkle className="absolute right-6 bottom-24 w-4" style={{ animationDelay: "1s" }} />
          <TypingBubble className="absolute top-4 right-4 scale-75 rotate-6" tone="primary" />

          <input id="avatarUpload" name="avatar" type="file" accept="image/*" onChange={avatar.changeHandler} className="sr-only" />
          <label
            htmlFor="avatarUpload"
            aria-label="Choose a new profile picture"
            className="nb-polaroid group/photo relative mx-auto mt-4 block w-fit cursor-pointer rotate-[-4deg] rounded-xl border-2 border-[var(--nb-border-color)] bg-card p-2.5 pb-3 shadow-[var(--nb-shadow)] transition-transform duration-300 hover:rotate-0 has-[:focus-visible]:outline-3"
          >
            <span key={avatarPreview ?? "current"} className={cn("relative block overflow-hidden rounded-lg border-2 border-[var(--nb-border-color)]", avatarPreview && "nb-develop")}>
              <Avatar className="size-36 rounded-none border-0 shadow-none [&>*]:rounded-none">
                <AvatarImage src={avatarPreview || user?.avatar?.url} className="object-cover" />
                <AvatarFallback className="rounded-none bg-primary text-4xl font-extrabold text-on-color">{initials}</AvatarFallback>
              </Avatar>
              {updatedIsAnonymous && (
                <span key="disguise" aria-hidden="true" className="nb-disguise-drop absolute right-1.5 bottom-1.5 flex size-11 items-center justify-center rounded-full border-2 border-dashed border-[var(--nb-border-color)] bg-nb-accent text-on-color shadow-[2px_2px_0_var(--nb-shadow-color)]">
                  <HatGlasses className="size-6" />
                </span>
              )}
            </span>
            <span className="mt-2.5 block text-center text-base font-extrabold text-foreground">
              {updatedIsAnonymous ? "Anonymous" : <><span className="opacity-55">@</span>{handle}</>}
            </span>
            <span aria-hidden="true" className="nb-camera absolute -right-4 -bottom-3 flex size-11 items-center justify-center rounded-full border-2 border-[var(--nb-border-color)] bg-primary text-on-color shadow-[2px_2px_0_var(--nb-shadow-color)] group-hover/photo:animate-[nbWiggle_0.5s_ease-in-out]">
              <Camera className="size-5" />
            </span>
          </label>

          <div className="relative mt-6 flex flex-wrap items-center justify-center gap-2">
            <label htmlFor="avatarUpload" className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border-2 border-[var(--nb-border-color)] bg-card px-3 py-1.5 text-sm font-bold text-foreground shadow-[2px_2px_0_var(--nb-shadow-color)] tap-interactive">
              <ImageUp className="size-4" aria-hidden="true" />
              {avatar.file ? "Pick another" : "Change photo"}
            </label>
            {avatar.file && (
              <button type="button" onClick={() => avatar.clear()} className="nb-older-in inline-flex items-center gap-1.5 rounded-xl px-2 py-1.5 text-sm font-bold text-on-color underline underline-offset-2">
                <RotateCcw className="size-4" aria-hidden="true" />
                Undo
              </button>
            )}
          </div>
        </section>

        <div className="nb-stagger flex min-w-0 flex-col gap-6 [--nb-stagger-start:300ms]">
          {/* Account */}
          <section aria-labelledby="account-heading" className="rounded-2xl border-2 border-[var(--nb-border-color)] bg-card p-5 shadow-[var(--nb-shadow-sm)] sm:p-6">
            <h3 id="account-heading" className="flex items-center gap-2 text-lg font-extrabold text-foreground">
              <span aria-hidden="true" className="flex size-7 items-center justify-center rounded-lg border-2 border-[var(--nb-border-color)] bg-secondary text-on-color"><UserIcon className="size-4" /></span>
              Account
            </h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field id="profile-updatedUsername" label="Username" icon={UserIcon}>
                <Input id="profile-updatedUsername" type="text" value={updatedUsername.value} onChange={updatedUsername.changeHandler} className="pl-10" />
              </Field>
              <Field id="profile-updatedEmail" label="Email address" icon={Mail}>
                <Input id="profile-updatedEmail" type="email" value={updatedEmail.value} onChange={updatedEmail.changeHandler} className="pl-10" />
              </Field>
              <Field id="profile-password" label="New password" hint="Leave blank to keep your current one" icon={Lock} className="md:col-span-2">
                <Input id="profile-password" type="password" placeholder="New password" value={updatedPassword.value} onChange={updatedPassword.changeHandler} className="pl-10" />
              </Field>
            </div>
          </section>

          {/* Privacy */}
          <section aria-labelledby="privacy-heading" className="rounded-2xl border-2 border-[var(--nb-border-color)] bg-card p-5 shadow-[var(--nb-shadow-sm)] sm:p-6">
            <h3 id="privacy-heading" className="flex items-center gap-2 text-lg font-extrabold text-foreground">
              <span aria-hidden="true" className="flex size-7 items-center justify-center rounded-lg border-2 border-[var(--nb-border-color)] bg-nb-accent text-on-color"><HatGlasses className="size-4" /></span>
              Privacy
            </h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {/* Anonymous */}
              <div className={cn("flex flex-col gap-4 rounded-2xl border-2 p-4 transition-colors duration-300", updatedIsAnonymous ? "border-[var(--nb-border-color)] bg-nb-accent/20" : "border-[var(--nb-line)] bg-muted/50")}>
                <div className="flex items-center gap-4">
                  <span aria-hidden="true" className="relative size-14 shrink-0">
                    <Avatar className="size-14 border-2">
                      <AvatarImage src={avatarPreview || user?.avatar?.url} className="object-cover" />
                      <AvatarFallback className="bg-primary text-sm font-extrabold text-on-color">{initials}</AvatarFallback>
                    </Avatar>
                    {updatedIsAnonymous && (
                      <span className="nb-disguise-drop absolute inset-0 flex items-center justify-center rounded-full border-2 border-dashed border-[var(--nb-border-color)] bg-nb-accent text-on-color">
                        <HatGlasses className="size-7" />
                      </span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-extrabold text-foreground">Become anonymous</span>
                    <span key={String(updatedIsAnonymous)} className="nb-older-in mt-0.5 block truncate text-sm font-bold text-muted-foreground">
                      Seen as {updatedIsAnonymous ? <span className="text-nb-accent-text">Anonymous</span> : <span className="text-foreground">@{handle}</span>}
                    </span>
                  </span>
                  <StickerSwitch
                    label="Become anonymous"
                    checked={updatedIsAnonymous}
                    onCheckedChange={setUpdatedIsAnonymous}
                    onIcon={<HatGlasses className="size-4" />}
                    offIcon={<Eye className="size-4" />}
                  />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  {updatedIsAnonymous
                    ? "Your shouts and new Mumbles hide your name. People see a disguise instead."
                    : "Your shouts and Mumbles show your username and picture."}
                </p>
              </div>

              {/* Accept Mumbles */}
              <div className={cn("flex flex-col gap-4 rounded-2xl border-2 p-4 transition-colors duration-300", udatedIsAcceptingMumbles ? "border-[var(--nb-border-color)] bg-nb-success/20" : "border-[var(--nb-line)] bg-muted/50")}>
                <div className="flex items-center gap-4">
                  <span aria-hidden="true" className="relative flex size-14 shrink-0 items-center justify-center">
                    <span className={cn("flex size-14 items-center justify-center rounded-2xl border-2 border-[var(--nb-border-color)] transition-colors duration-300", udatedIsAcceptingMumbles ? "bg-nb-success text-on-color" : "bg-card text-muted-foreground")}>
                      {udatedIsAcceptingMumbles ? <Mailbox key="open" className="nb-older-in size-7" /> : <MessageCircleOff key="closed" className="nb-older-in size-7" />}
                    </span>
                    {udatedIsAcceptingMumbles ? (
                      <span key="note" className="nb-note-fly absolute -top-2 -right-3 flex h-5 w-7 items-center justify-center gap-0.5 rounded-md rounded-bl-sm border-2 border-[var(--nb-border-color)] bg-nb-accent">
                        <span className="size-1 rounded-full bg-on-color" />
                        <span className="size-1 rounded-full bg-on-color" />
                        <span className="size-1 rounded-full bg-on-color" />
                      </span>
                    ) : (
                      <span key="sign" className="nb-sign-swing absolute -bottom-2 -right-3 rounded-md border-2 border-[var(--nb-border-color)] bg-destructive px-1 text-[0.6rem] font-extrabold uppercase text-on-color">
                        Closed
                      </span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-extrabold text-foreground">Accept Mumbles</span>
                    <span key={String(udatedIsAcceptingMumbles)} className="nb-older-in mt-0.5 block truncate text-sm font-bold text-muted-foreground">
                      {udatedIsAcceptingMumbles ? <span className="text-foreground">Your inbox is open</span> : "Your inbox is closed"}
                    </span>
                  </span>
                  <StickerSwitch
                    label="Accept Mumbles"
                    checked={udatedIsAcceptingMumbles}
                    onCheckedChange={setUpdatedIsAcceptingMumbles}
                    onFill="bg-nb-success"
                    onIcon={<Check className="size-4" strokeWidth={3} />}
                    offIcon={<X className="size-4" strokeWidth={3} />}
                  />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  {udatedIsAcceptingMumbles
                    ? "Anyone can find you and leave you a quiet note."
                    : "Nobody can send you new Mumbles, and you won't show up when people search to send one."}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Save bar: only while there are unsaved changes */}
      {isDirty && (
        <div className="nb-savebar sticky bottom-24 z-30 flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-[var(--nb-border-color)] bg-card px-4 py-3 shadow-[var(--nb-shadow)] md:bottom-6">
          <span className="flex items-center gap-2 text-sm font-bold text-foreground">
            <span aria-hidden="true" className="size-2.5 animate-pulse rounded-full bg-nb-warning" />
            You have unsaved changes
          </span>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={discardChanges} disabled={isPending}>
              Discard
            </Button>
            <Button onClick={submitUpdateRequest} loading={isPending} disabled={updatedEmail.value === "" || updatedUsername.value === ""}>
              <Save className="h-4 w-4" aria-hidden="true" />
              Save changes
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  id,
  label,
  hint,
  icon: Icon,
  className,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={id} className="flex items-baseline gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label}
        {hint && <span className="text-xs font-medium normal-case tracking-normal">· {hint}</span>}
      </label>
      <div className="relative">
        <Icon className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        {children}
      </div>
    </div>
  );
}
