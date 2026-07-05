"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { Heart, Pin, MoreVertical, Loader2 } from "lucide-react";

import { getMumblesApi, pinMumbleApi } from "@/api/echo_mumble.api";
import {
  setPinnedMumbles,
  updateMumbles,
  removePinnedMumble,
} from "@/store/slices/echo_mumble.slice";
import { RootState } from "@/store/store";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function MyMumblesPage() {
  const dispatch = useDispatch();
  const { pinnedMumblesInMyProfile } = useSelector((state: RootState) => state.echoMumble);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    const fetchPinnedMumbles = async () => {
      try {
        setIsPending(true);
        const response = await getMumblesApi();
        const pinned = response?.data?.mumbles?.filter(
          (mumble: any) => mumble?.pinned === true
        );
        dispatch(setPinnedMumbles(pinned || []));
      } catch (error) {
        console.error("Error fetching pinned mumbles:", error);
        toast.error("Failed to load pinned mumbles.");
      } finally {
        setIsPending(false);
      }
    };
    fetchPinnedMumbles();
  }, [dispatch]);

  const unpinMumble = async (mumbleId: string) => {
    try {
      setIsPending(true);
      const response = await pinMumbleApi(mumbleId);
      if (response?.data) {
        const { updatedMumble, message } = response.data;
        dispatch(updateMumbles(updatedMumble));
        dispatch(removePinnedMumble(updatedMumble?._id));
        toast.success(message || "Unpinned successfully!");
      }
    } catch (error) {
      console.error("Error unpinning mumble:", error);
      toast.error("Failed to unpin the mumble.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-slate-900 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            My Pinned Mumbles
          </h2>
          <p className="text-xs text-slate-500">Your favorite whispers and pinned thoughts</p>
        </div>
        {isPending && <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />}
      </div>

      {pinnedMumblesInMyProfile?.length === 0 ? (
        <div className="flex flex-col justify-center items-center text-center p-8 bg-slate-950/20 border border-slate-900 rounded-3xl min-h-[250px]">
          <Pin className="h-8 w-8 text-slate-600 mb-2 rotate-45" />
          <p className="text-slate-500 text-sm font-medium">No pinned mumbles</p>
          <p className="text-[10px] text-slate-650 mt-1">Pin whispers in your inbox to see them highlighted here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pinnedMumblesInMyProfile?.map((mumble: any) => {
            const hasLikes = mumble?.likes?.length > 0;
            return (
              <Card key={mumble._id} className="relative bg-slate-900/20 border border-slate-900 overflow-hidden group">
                <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-slate-350">
                      @{mumble?.sender?.username || "anonymous"}
                    </span>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger render={
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white rounded-full">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    } />
                    <DropdownMenuContent className="bg-slate-950 border-slate-800 text-white w-40">
                      <DropdownMenuItem
                        onClick={() => unpinMumble(mumble._id)}
                        className="hover:bg-slate-900 cursor-pointer text-xs flex gap-2"
                      >
                        <Pin className="h-3.5 w-3.5" />
                        Unpin Mumble
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>

                <CardContent className="px-4 pb-12 pt-1">
                  <p className="text-xs text-slate-300 font-light leading-relaxed whitespace-pre-wrap break-words">
                    {mumble?.message}
                  </p>
                </CardContent>

                {/* Likes indicator at bottom right */}
                <div className="absolute bottom-4 right-4 flex items-center space-x-1.5 text-slate-500">
                  <span className="text-[10px] font-medium">{mumble?.likes?.length || 0}</span>
                  <Heart className={`h-4 w-4 ${hasLikes ? "fill-rose-500 text-rose-500 animate-pulse" : ""}`} />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
