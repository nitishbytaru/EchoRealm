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
    <div className="space-y-5 max-w-md mx-auto">
      <div className="space-y-0.5">
        <h2 className="text-xl font-bold tracking-tight text-zinc-100">
          Profile Details
        </h2>
        <p className="text-[10px] text-zinc-555 mt-0.5">Update your account username, email, password, and preferences</p>
      </div>

      <div className="flex flex-col items-center justify-center space-y-2 py-4 bg-zinc-900/10 border border-zinc-900 rounded-xl">
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
            <Avatar className="h-20 w-20 border border-zinc-800 group-hover:border-indigo-500/50 transition-colors">
              <AvatarImage src={avatarPreview || user?.avatar?.url} className="object-cover" />
              <AvatarFallback className="bg-zinc-950 text-indigo-400 text-xl">
                {user?.username?.slice(0, 2).toUpperCase() || "ME"}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Camera className="h-4 w-4 text-zinc-100" />
            </div>
          </label>
        </div>

        <div className="text-center">
          <h3 className="text-xs font-semibold text-zinc-200">@{user?.username}</h3>
          <p className="text-[9px] text-zinc-500">Click avatar to select a new image</p>
        </div>
      </div>

      <div className="space-y-4 pt-2">
        {/* Email */}
        <div className="space-y-2">
          <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              type="email"
              value={updatedEmail.value}
              onChange={updatedEmail.changeHandler}
              className="pl-9 bg-zinc-900 border-zinc-800 focus-visible:ring-indigo-500 text-zinc-50 placeholder:text-zinc-650 text-xs h-9 rounded-lg"
            />
          </div>
        </div>

        {/* Username */}
        <div className="space-y-2">
          <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Username</label>
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              type="text"
              value={updatedUsername.value}
              onChange={updatedUsername.changeHandler}
              className="pl-9 bg-zinc-900 border-zinc-800 focus-visible:ring-indigo-500 text-zinc-50 placeholder:text-zinc-650 text-xs h-9 rounded-lg"
            />
          </div>
        </div>

        {/* New Password */}
        <div className="space-y-2">
          <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">New Password (leave blank if unchanged)</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              type="password"
              placeholder="Enter new password"
              value={updatedPassword.value}
              onChange={updatedPassword.changeHandler}
              className="pl-9 bg-zinc-900 border-zinc-800 focus-visible:ring-indigo-500 text-zinc-50 placeholder:text-zinc-650 text-xs h-9 rounded-lg"
            />
          </div>
        </div>

        <div className="border-t border-zinc-900 pt-4 mt-6 space-y-4">
          {/* Become Anonymous Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-semibold text-zinc-200">Become Anonymous</h4>
              <p className="text-[9px] text-zinc-500">Hide your active identity details from public posts</p>
            </div>
            <Switch
              checked={updatedIsAnonymous}
              onCheckedChange={setUpdatedIsAnonymous}
              className="data-[state=checked]:bg-indigo-650"
            />
          </div>

          {/* Accept Mumbles Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-semibold text-zinc-200">Accept Mumbles</h4>
              <p className="text-[9px] text-zinc-500">Allow other members to send anonymous whispers to you</p>
            </div>
            <Switch
              checked={udatedIsAcceptingMumbles}
              onCheckedChange={setUpdatedIsAcceptingMumbles}
              className="data-[state=checked]:bg-indigo-650"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            onClick={submitUpdateRequest}
            disabled={isPending || updatedEmail.value === "" || updatedUsername.value === ""}
            className="bg-indigo-650 hover:bg-indigo-600 text-zinc-50 text-xs px-4 h-9 rounded-lg shadow-sm shadow-indigo-950/20 tap-interactive"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
