"use client";

import React, { useRef, useState } from "react";
import { Paperclip, X, Send, AlertCircle } from "lucide-react";

import { useFileHandler } from "@/hooks/useFileHandler";
import { useInputValidation } from "@/hooks/useInputValidation";
import { handleKeyPress } from "@/utils/helpers/micro_funcs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MessageBarProps {
  onSend: (data: FormData) => Promise<void>;
  leading?: React.ReactNode;
  placeholder?: string;
  sendLabel?: string;
}

const CHARACTER_LIMIT = 55;

export const MessageBar: React.FC<MessageBarProps> = ({
  onSend,
  leading,
  placeholder = "Type a message...",
  sendLabel = "Send message",
}) => {
  const attachments = useFileHandler("single");
  const message = useInputValidation("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [sendFailed, setSendFailed] = useState(false);

  const isOverLimit = message.value.length > CHARACTER_LIMIT;
  const canSend = !isSending && !isOverLimit && message.value.trim().length > 0;

  const sendCurrentMessage = async () => {
    if (!canSend) return;

    const text = message.value;
    const file = attachments.file;
    const formData = new FormData();
    formData.append("message", text);
    if (file) formData.append("attachments", file);

    message.clear();
    attachments.clear();
    setSendFailed(false);
    setIsSending(true);
    try {
      await onSend(formData);
    } catch {
      message.setValue(text);
      attachments.setFile(file);
      setSendFailed(true);
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex-none">
      {sendFailed && (
        <p role="alert" className="mb-2 flex items-center gap-2 text-sm font-bold text-nb-danger-text">
          <AlertCircle className="h-4 w-4 shrink-0" />
          That didn&apos;t send. Your message is still here, so you can try again.
        </p>
      )}
      <div className="flex items-center gap-2">
        {leading}
        <div className="relative shrink-0">
          <label
            htmlFor="attachments-file-input"
            title="Attach an image"
            className="inline-flex size-11 cursor-pointer items-center justify-center rounded-xl border-[3px] border-[var(--nb-border-color)] bg-card text-foreground has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-foreground tap-interactive"
          >
            <Paperclip className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Attach an image</span>
          </label>
          <input
            id="attachments-file-input"
            name="attachments"
            type="file"
            accept="image/*"
            onChange={attachments.changeHandler}
            className="sr-only"
          />
          {attachments.file && (
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full border-[2px] border-[var(--nb-border-color)] bg-nb-success" />
          )}
        </div>

        <div className="relative min-w-0 grow">
          <Input
            ref={inputRef}
            type="text"
            aria-label={placeholder}
            aria-invalid={isOverLimit || undefined}
            className="w-full pr-14 text-base md:text-sm"
            placeholder={attachments.file ? `Add a caption for ${attachments.file.name}` : placeholder}
            onChange={message.changeHandler}
            value={message.value}
            onKeyDown={(e) => handleKeyPress(e, sendCurrentMessage)}
          />
          {attachments.file ? (
            <button
              type="button"
              aria-label="Remove attached image"
              className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
              onClick={() => attachments.clear()}
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <span
              className={`absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs font-bold ${
                isOverLimit ? "text-nb-danger-text" : "text-muted-foreground"
              }`}
            >
              {message.value.length}/{CHARACTER_LIMIT}
            </span>
          )}
        </div>

        <Button
          type="button"
          size="icon-lg"
          onClick={sendCurrentMessage}
          disabled={!canSend}
          loading={isSending}
          aria-label={sendLabel}
          className="shrink-0 rounded-xl"
        >
          {!isSending && <Send className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  );
};

export default MessageBar;
