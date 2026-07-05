"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { MessageCircle, Mail, Send } from "lucide-react";
import { RootState } from "@/store/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const MumbleIcon: React.FC = () => {
  const { isLoggedIn, isMobile } = useSelector((state: RootState) => state.auth);
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="flex items-center gap-2 cursor-pointer w-full text-left">
        <MessageCircle className="h-5 w-5" />
        {!isMobile && <span className="ml-2">EchoMumble</span>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-slate-950 border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-bold">EchoMumble Options</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col sm:flex-row gap-4 py-4">
          {isLoggedIn && (
            <Link href="/mumbles/read" className="flex-1" onClick={() => setOpen(false)}>
              <Button variant="secondary" className="w-full h-16 flex flex-col items-center justify-center gap-1 bg-slate-900 border-slate-800 hover:bg-slate-800 text-white">
                <Mail className="h-5 w-5 text-indigo-400" />
                <span className="text-xs">Checkout Mumbles</span>
              </Button>
            </Link>
          )}
          <Link href="/mumbles/send" className="flex-1" onClick={() => setOpen(false)}>
            <Button variant="secondary" className="w-full h-16 flex flex-col items-center justify-center gap-1 bg-slate-900 border-slate-800 hover:bg-slate-800 text-white">
              <Send className="h-5 w-5 text-purple-400" />
              <span className="text-xs">Mumble to someone</span>
            </Button>
          </Link>
        </div>
        <div className="flex justify-end">
          <DialogClose render={<Button variant="ghost" className="hover:bg-slate-900 text-slate-400 hover:text-white" />}>
            Close
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MumbleIcon;
