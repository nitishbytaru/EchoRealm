"use client";

import React from "react";
import { toast } from "sonner";
import { Paperclip, X, Send } from "lucide-react";

import { useFileHandler } from "@/hooks/useFileHandler";
import { useInputValidation } from "@/hooks/useInputValidation";
import { handleKeyPress } from "@/utils/helpers/micro_funcs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MessageBarProps {
  setMessageData: (data: FormData) => void;
}

export const MessageBar: React.FC<MessageBarProps> = ({ setMessageData }) => {
  const attachments = useFileHandler("single");
  const message = useInputValidation("");

  const sendCurrentMessage = async () => {
    if (!message.value && !attachments.file) {
      toast.error("Please enter a message or select a file");
      return;
    }

    const formData = new FormData();
    if (message.value) {
      formData.append("message", message.value);
    }
    if (attachments.file) {
      formData.append("attachments", attachments.file);
    }

    try {
      setMessageData(formData);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      message.clear();
      attachments.clear();
    }
  };

  const CHARACTER_LIMIT = 55;
  const isOverLimit = message.value.length > CHARACTER_LIMIT;

  return (
    <div className="bg-slate-950 pt-2 sm:p-4 flex-none border-t border-slate-900">
      <div className="flex items-center gap-2 max-w-4xl mx-auto">
        <div className="relative flex-shrink-0">
          <label
            htmlFor="attachments-file-input"
            className="inline-flex items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300 size-8 cursor-pointer hover:bg-slate-800 hover:text-white transition-all"
          >
            <Paperclip className="h-5 w-5" />
          </label>
          <input
            id="attachments-file-input"
            name="attachments"
            type="file"
            accept="image/*"
            onChange={attachments.changeHandler}
            className="absolute inset-0 w-0 h-0 opacity-0 pointer-events-none"
          />
          {attachments.file && (
            <span className="absolute -top-1 -right-1 bg-indigo-500 rounded-full w-2.5 h-2.5 shadow-lg animate-pulse" />
          )}
        </div>

        <div className="grow relative">
          <Input
            type="text"
            className={`w-full bg-slate-900/50 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500 pr-10 ${
              isOverLimit ? "border-red-500 focus-visible:ring-red-500" : ""
            }`}
            placeholder={
              attachments.file ? `File: ${attachments.file.name}` : "Type a message..."
            }
            onChange={message.changeHandler}
            value={message.value}
            onKeyDown={(e) => handleKeyPress(e, sendCurrentMessage)}
          />
          {attachments.file && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 text-slate-400 hover:text-white"
              onClick={() => attachments.clear()}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex flex-col items-end justify-center min-w-[45px]">
          <span
            className={`text-[10px] font-mono ${
              isOverLimit ? "text-red-500 font-bold" : "text-slate-500"
            }`}
          >
            {message.value.length}/{CHARACTER_LIMIT}
          </span>
        </div>

        <Button
          type="button"
          size="icon"
          onClick={sendCurrentMessage}
          disabled={isOverLimit || (!message.value && !attachments.file)}
          className="bg-indigo-500 hover:bg-indigo-600 text-white flex-shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default MessageBar;
