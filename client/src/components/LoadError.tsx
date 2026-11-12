"use client";

import { AlertCircle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LoadErrorProps {
  /** What failed to load, e.g. "your friends". */
  what: string;
  onRetry: () => void;
  className?: string;
}

/**
 * Inline failure state for a list that couldn't load, so a failed fetch
 * never looks the same as an empty list.
 */
export default function LoadError({ what, onRetry, className }: LoadErrorProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-2xl border-[3px] border-[var(--nb-border-color)] bg-card p-6 text-center",
        className
      )}
    >
      <AlertCircle className="h-6 w-6 text-nb-danger-text" aria-hidden="true" />
      <p className="text-sm font-bold text-foreground">We couldn&apos;t load {what}.</p>
      <p className="text-sm text-muted-foreground">Check your connection, then try again.</p>
      <Button type="button" variant="outline" onClick={onRetry}>
        <RotateCw className="h-4 w-4" aria-hidden="true" />
        Try again
      </Button>
    </div>
  );
}
