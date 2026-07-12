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
    formData.append("udatedIsAcceptingMumbles", String(udatedIsAcceptingMumbles));
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
    <div className="space-y-6 max-w-md mx-auto">
      <div className="space-y-1">
        <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
          Profile Details
        </h2>
        <p className="text-sm text-muted-foreground font-medium mt-1">Update your account username, email, password, and preferences</p>
      </div>

      <div className="flex flex-col items-center justify-center space-y-3 py-5 bg-muted/50 border-[3px] border-[var(--nb-border-color)] shadow-[var(--nb-shadow-sm)] rounded-2xl">
        <input
          id="avatarUpload"
          name="avatar"
          type="file"
          accept="image/*"
          onChange={avatar.changeHandler}
          className="hidden"
        />

        <div className="relative group">
          <label htmlFor="avatarUpload" className="cursor-pointer block relative">
            <Avatar className="h-24 w-24" size="lg">
              <AvatarImage src={avatarPreview || user?.avatar?.url} className="object-cover" />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-extrabold">
                {user?.username?.slice(0, 2).toUpperCase() || "ME"}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 bg-foreground/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity border-[3px] border-[var(--nb-border-color)]">
              <Camera className="h-5 w-5 text-background" />
            </div>
          </label>
        </div>

        <div className="text-center">
          <h3 className="text-sm font-bold text-foreground">@{user?.username}</h3>
          <p className="text-xs text-muted-foreground font-medium">Click avatar to select a new image</p>
        </div>
      </div>

      <div className="space-y-5 pt-2">
        {/* Email */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="email"
              value={updatedEmail.value}
              onChange={updatedEmail.changeHandler}
              className="pl-10"
            />
          </div>
        </div>

        {/* Username */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Username</label>
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              value={updatedUsername.value}
              onChange={updatedUsername.changeHandler}
              className="pl-10"
            />
          </div>
        </div>

        {/* New Password */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">New Password (leave blank if unchanged)</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="password"
              placeholder="Enter new password"
              value={updatedPassword.value}
              onChange={updatedPassword.changeHandler}
              className="pl-10"
            />
          </div>
        </div>

        <div className="border-t-[3px] border-[var(--nb-border-color)] pt-5 mt-6 space-y-5">
          {/* Become Anonymous Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-foreground">Become Anonymous</h4>
              <p className="text-xs text-muted-foreground font-medium">Hide your active identity details from public posts</p>
            </div>
            <Switch
              checked={updatedIsAnonymous}
              onCheckedChange={setUpdatedIsAnonymous}
            />
          </div>

          {/* Accept Mumbles Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-foreground">Accept Mumbles</h4>
              <p className="text-xs text-muted-foreground font-medium">Allow other members to send anonymous whispers to you</p>
            </div>
            <Switch
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
  );
}
