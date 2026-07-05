"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "@/hooks/use-toast";
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
import { Skeleton } from "@/components/ui/skeleton";

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
    <div className="space-y-4">
      <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-100">
            My Pinned Mumbles
          </h2>
          <p className="text-[10px] text-zinc-555 mt-0.5">Your favorite whispers and pinned thoughts</p>
        </div>
        {isPending && <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />}
      </div>

      {isPending && (!pinnedMumblesInMyProfile || pinnedMumblesInMyProfile.length === 0) ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="bg-zinc-900/10 border border-zinc-900 overflow-hidden rounded-xl">
              <CardContent className="p-4 space-y-3 pt-6">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-3.5 w-20 rounded-md" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                </div>
                <Skeleton className="h-12 w-full rounded-md" />
                <div className="flex justify-end pt-2">
                  <Skeleton className="h-3 w-16 rounded-md" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : pinnedMumblesInMyProfile?.length === 0 ? (
        <div className="flex flex-col justify-center items-center text-center p-8 bg-zinc-900/10 border border-zinc-900 rounded-xl min-h-[250px] animate-fade-in">
          <Pin className="h-6 w-6 text-zinc-600 mb-2 rotate-45" />
          <p className="text-zinc-555 text-xs font-semibold">No pinned mumbles</p>
          <p className="text-[9px] text-zinc-650 mt-2">Pin whispers in your inbox to see them highlighted here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pinnedMumblesInMyProfile?.map((mumble: any) => {
            const hasLikes = mumble?.likes?.length > 0;
            return (
              <Card key={mumble._id} className="relative bg-zinc-900/10 border border-zinc-900 overflow-hidden rounded-xl card-interactive">
                <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-semibold text-zinc-350">
                      @{mumble?.sender?.username || "anonymous"}
                    </span>
                  </div>
 
                  <DropdownMenu>
                    <DropdownMenuTrigger render={
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-500 hover:text-zinc-200 rounded-lg tap-interactive">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    } />
                    <DropdownMenuContent className="bg-zinc-950 border-zinc-900 text-zinc-200 w-40 rounded-lg">
                      <DropdownMenuItem
                        onClick={() => unpinMumble(mumble._id)}
                        className="hover:bg-zinc-900 cursor-pointer text-xs flex gap-2"
                      >
                        <Pin className="h-4 w-4" />
                        Unpin Mumble
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>

                <CardContent className="px-4 pb-10 pt-2">
                  <p className="text-xs text-zinc-300 font-light leading-relaxed whitespace-pre-wrap break-words">
                    {mumble?.message}
                  </p>
                </CardContent>

                {/* Likes indicator at bottom right */}
                <div className="absolute bottom-4 right-4 flex items-center space-x-2 text-zinc-500">
                  <span className="text-[9px] font-medium">{mumble?.likes?.length || 0}</span>
                  <Heart className={`h-4 w-4 ${hasLikes ? "fill-rose-500 text-rose-500" : ""}`} />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
