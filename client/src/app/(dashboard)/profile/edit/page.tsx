"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { Camera, Mail, User as UserIcon, Lock, Loader2, Save } from "lucide-react";

import { updateRequestApi } from "@/api/user.api";
import { useFileHandler } from "@/hooks/useFileHandler";
import { useInputValidation } from "@/hooks/useInputValidation";
import { setUser } from "@/store/slices/auth.slice";
import { RootState } from "@/store/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/PageHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";

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
    <div className="space-y-6">
      <PageHeader as="h2" title="Profile details" description="Your picture, username, email, password and privacy." />

      <div className="grid items-start gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
      <div className="flex flex-col items-center justify-center space-y-3 rounded-2xl border-[3px] border-[var(--nb-border-color)] bg-muted/60 px-4 py-6 shadow-[var(--nb-shadow-sm)] lg:sticky lg:top-24">
        <input
          id="avatarUpload"
          name="avatar"
          type="file"
          accept="image/*"
          onChange={avatar.changeHandler}
          className="sr-only"
        />

        <div className="relative group">
          <label htmlFor="avatarUpload" aria-label="Choose a new profile picture" className="cursor-pointer block relative has-[:focus-visible]:outline-3">
            <Avatar className="size-24 data-[size=lg]:size-24" size="lg">
              <AvatarImage src={avatarPreview || user?.avatar?.url} className="object-cover" />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-extrabold">
                {user?.username?.slice(0, 2).toUpperCase() || "ME"}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 flex size-9 items-center justify-center rounded-full bg-primary text-on-color border-[3px] border-[var(--nb-border-color)]">
              <Camera className="h-4 w-4" aria-hidden="true" />
            </div>
          </label>
        </div>

        <div className="text-center">
          <h3 className="text-sm font-bold text-foreground">@{user?.username}</h3>
          <p className="text-sm text-muted-foreground font-medium">Tap your picture to change it</p>
        </div>
      </div>

      <div className="max-w-xl space-y-5">
        {/* Email */}
        <div className="space-y-2">
          <label htmlFor="profile-updatedEmail" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="profile-updatedEmail"
              type="email"
              value={updatedEmail.value}
              onChange={updatedEmail.changeHandler}
              className="pl-10"
            />
          </div>
        </div>

        {/* Username */}
        <div className="space-y-2">
          <label htmlFor="profile-updatedUsername" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Username</label>
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="profile-updatedUsername"
              type="text"
              value={updatedUsername.value}
              onChange={updatedUsername.changeHandler}
              className="pl-10"
            />
          </div>
        </div>

        {/* New Password */}
        <div className="space-y-2">
          <label htmlFor="profile-password" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">New Password (leave blank if unchanged)</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="profile-password"
              type="password"
              placeholder="Enter new password"
              value={updatedPassword.value}
              onChange={updatedPassword.changeHandler}
              className="pl-10"
            />
          </div>
        </div>

        <div className="mt-6 grid gap-3">
          {/* Become Anonymous Toggle */}
          <div className="flex items-center justify-between gap-4 rounded-xl border-[3px] border-[var(--nb-border-color)] bg-card p-4 shadow-[var(--nb-shadow-sm)]">
            <div>
              <h4 className="text-sm font-bold text-foreground">Become Anonymous</h4>
              <p className="text-sm text-muted-foreground font-medium">Post to EchoShout as anonymous, and start each Mumble as anonymous</p>
            </div>
            <Switch
              aria-label="Become Anonymous"
              checked={updatedIsAnonymous}
              onCheckedChange={setUpdatedIsAnonymous}
            />
          </div>

          {/* Accept Mumbles Toggle */}
          <div className="flex items-center justify-between gap-4 rounded-xl border-[3px] border-[var(--nb-border-color)] bg-card p-4 shadow-[var(--nb-shadow-sm)]">
            <div>
              <h4 className="text-sm font-bold text-foreground">Accept Mumbles</h4>
              <p className="text-sm text-muted-foreground font-medium">Let other people send you Mumbles</p>
            </div>
            <Switch
              aria-label="Accept Mumbles"
              checked={udatedIsAcceptingMumbles}
              onCheckedChange={setUpdatedIsAcceptingMumbles}
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            onClick={submitUpdateRequest}
            disabled={isPending || updatedEmail.value === "" || updatedUsername.value === ""}
            size="lg"
          >
            {isPending ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : (
              <Save className="h-5 w-5 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>
      </div>
    </div>
  );
}
