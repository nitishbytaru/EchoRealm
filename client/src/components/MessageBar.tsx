"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Paperclip, X, Send, AlertCircle, Loader2 } from "lucide-react";

import { useFileHandler } from "@/hooks/useFileHandler";
import { useInputValidation } from "@/hooks/useInputValidation";
import { handleKeyPress } from "@/utils/helpers/micro_funcs";
import { cn } from "@/lib/utils";

interface MessageBarProps {
  onSend: (data: FormData) => Promise<void>;
  /** Extra control shown inside the bar, before the paperclip (e.g. EchoShout's identity button). */
  leading?: React.ReactNode;
  placeholder?: string;
  sendLabel?: string;
  /** Called when the user types "@" at the start of a word; the "@" is removed. */
  onMentionTrigger?: () => void;
}

const CHARACTER_LIMIT = 55;
const COUNTER_THRESHOLD = 40;

/** The composer: one outlined sticker bar with attach, text, counter and a yellow send button. */
export const MessageBar: React.FC<MessageBarProps> = ({
  onSend,
  leading,
  placeholder = "Message",
  sendLabel = "Send message",
  onMentionTrigger,
}) => {
  const attachments = useFileHandler("single");
  const message = useInputValidation("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [sendFailed, setSendFailed] = useState(false);

  const previewUrl = useMemo(() => (attachments.file ? URL.createObjectURL(attachments.file) : null), [attachments.file]);
  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const clearAttachment = () => {
    attachments.clear();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    const typedAt =
      onMentionTrigger &&
      next.length === message.value.length + 1 &&
      next.endsWith("@") &&
      (next.length === 1 || /\s/.test(next[next.length - 2]));
    if (typedAt) {
      message.setValue(next.slice(0, -1));
      onMentionTrigger();
      return;
    }
    message.changeHandler(e);
  };

  const length = message.value.length;
  const isOverLimit = length > CHARACTER_LIMIT;
  const canSend = !isSending && !isOverLimit && message.value.trim().length > 0;

  const sendCurrentMessage = async () => {
    if (!canSend) return;

    const text = message.value;
    const file = attachments.file;
    const formData = new FormData();
    formData.append("message", text);
    if (file) formData.append("attachments", file);

    message.clear();
    clearAttachment();
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

      {attachments.file && previewUrl && (
        <div className="nb-older-in mb-2.5 inline-flex max-w-full items-center gap-2.5 rounded-xl border-[2px] border-[var(--nb-border-color)] bg-card py-1 pr-1 pl-1 shadow-[2px_2px_0_var(--nb-shadow-color)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="" className="size-9 shrink-0 rounded-lg border-[2px] border-[var(--nb-border-color)] object-cover" />
          <span className="min-w-0 truncate text-xs font-bold text-foreground">{attachments.file.name}</span>
          <button
            type="button"
            aria-label="Remove attached image"
            onClick={clearAttachment}
            className="flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div
        className={cn(
          "nb-composer flex items-center gap-1 rounded-2xl border-2 bg-card p-1.5 pl-2",
          isOverLimit ? "border-nb-danger-text" : "border-[var(--nb-border-color)]"
        )}
      >
        {leading}

        <label
          htmlFor="attachments-file-input"
          title="Attach an image"
          className={cn(
            "flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-xl transition-colors has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-foreground",
            attachments.file ? "bg-nb-success text-on-color" : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Paperclip className="h-5 w-5" aria-hidden="true" />
          <span className="sr-only">Attach an image</span>
          <input
            ref={fileInputRef}
            id="attachments-file-input"
            name="attachments"
            type="file"
            accept="image/*"
            onChange={attachments.changeHandler}
            className="sr-only"
          />
        </label>

        <input
          ref={inputRef}
          type="text"
          aria-label={placeholder}
          aria-invalid={isOverLimit || undefined}
          className="nb-composer-input h-9 min-w-0 flex-1 bg-transparent px-2 text-base font-medium text-foreground outline-none placeholder:text-muted-foreground md:text-sm"
          placeholder={attachments.file ? "Add a caption" : placeholder}
          onChange={handleChange}
          value={message.value}
          onKeyDown={(e) => handleKeyPress(e, sendCurrentMessage)}
        />

        {length >= COUNTER_THRESHOLD && (
          <span
            aria-live="polite"
            className={cn(
              "shrink-0 rounded-md px-1.5 font-mono text-xs font-bold",
              isOverLimit ? "bg-destructive text-on-color" : "text-muted-foreground"
            )}
          >
            {length}/{CHARACTER_LIMIT}
          </span>
        )}

        <button
          type="button"
          onClick={sendCurrentMessage}
          disabled={!canSend}
          aria-label={sendLabel}
          aria-busy={isSending || undefined}
          className={cn(
            "nb-send flex size-10 shrink-0 items-center justify-center rounded-xl border-2 border-[var(--nb-border-color)] text-on-color",
            canSend || isSending ? "bg-primary shadow-[var(--nb-shadow-sm)]" : "cursor-not-allowed bg-muted text-muted-foreground shadow-none"
          )}
        >
          {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5 -translate-x-px translate-y-px" />}
        </button>
      </div>
    </div>
  );
};

export default MessageBar;
