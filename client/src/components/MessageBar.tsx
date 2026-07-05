"use client";

import React from "react";
import { toast } from "@/hooks/use-toast";
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
    <div
      className="py-2 flex-none border-0"
      style={{
        background: "var(--background)",
        boxShadow: "0 -4px 12px var(--nm-dark, rgba(0,0,0,0.12)), 0 -1px 0 var(--nm-light, rgba(255,255,255,0.7))",
      }}
    >
      <div className="flex items-center gap-2 max-w-4xl mx-auto px-4">
        <div className="relative flex-shrink-0">
          <label
            htmlFor="attachments-file-input"
            className="inline-flex items-center justify-center rounded-lg text-muted-foreground size-9 cursor-pointer hover:text-foreground transition-all tap-interactive border-0"
            style={{
              background: "var(--background)",
              boxShadow: "var(--nm-raised, 3px 3px 8px rgba(0,0,0,0.12), -2px -2px 6px rgba(255,255,255,0.8))",
            }}
          >
            <Paperclip className="h-4 w-4" />
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
            <span className="absolute -top-1 -right-1 bg-indigo-500 rounded-full w-2.5 h-2.5 shadow-lg" />
          )}
        </div>

        <div className="grow relative">
          <Input
            type="text"
            className={`w-full text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-indigo-500 pr-9 rounded-lg h-9 text-xs border-0 ${
              isOverLimit ? "focus-visible:ring-red-500" : ""
            }`}
            style={{
              background: "var(--background)",
              boxShadow: isOverLimit
                ? "var(--nm-inset, inset 2px 2px 6px rgba(0,0,0,0.15)), 0 0 0 2px rgba(239,68,68,0.3)"
                : "var(--nm-inset, inset 2px 2px 6px rgba(0,0,0,0.15))",
            }}
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
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 text-muted-foreground hover:text-foreground tap-interactive"
              onClick={() => attachments.clear()}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex flex-col items-end justify-center min-w-[40px]">
          <span
            className={`text-[9px] font-mono ${
              isOverLimit ? "text-red-500 font-bold" : "text-muted-foreground"
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
          className="bg-indigo-600 hover:bg-indigo-500 text-white flex-shrink-0 h-9 w-9 rounded-lg shadow-sm shadow-indigo-950/30 tap-interactive border-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default MessageBar;
