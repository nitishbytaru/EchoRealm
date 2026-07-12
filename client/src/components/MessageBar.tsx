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
    <div className="py-3 flex-none bg-card border-t-[3px] border-[var(--nb-border-color)]">
      <div className="flex items-center gap-3 max-w-4xl mx-auto px-4">
        <div className="relative flex-shrink-0">
          <label
            htmlFor="attachments-file-input"
            className="inline-flex items-center justify-center rounded-xl text-muted-foreground size-10 cursor-pointer hover:text-foreground transition-all tap-interactive bg-card border-[3px] border-[var(--nb-border-color)] shadow-[var(--nb-shadow-sm)]"
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
            <span className="absolute -top-1 -right-1 bg-nb-success rounded-full w-3 h-3 border-[2px] border-[var(--nb-border-color)]" />
          )}
        </div>

        <div className="grow relative">
          <Input
            type="text"
            className={`w-full text-foreground placeholder:text-muted-foreground/70 pr-9 h-10 text-sm ${
              isOverLimit ? "border-destructive focus-visible:ring-destructive/30" : ""
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
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 text-muted-foreground hover:text-foreground border-0 shadow-none hover:shadow-none"
              onClick={() => attachments.clear()}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex flex-col items-end justify-center min-w-[40px]">
          <span
            className={`text-[10px] font-bold font-mono ${
              isOverLimit ? "text-destructive" : "text-muted-foreground"
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
          className="bg-primary text-primary-foreground flex-shrink-0 h-10 w-10 rounded-xl"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default MessageBar;
