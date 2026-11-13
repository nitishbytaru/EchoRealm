import { cn } from "@/lib/utils";

/** Small sticker for background work (refreshing or saving), with the logo's bouncing dots. */
export default function BusyBadge({ label = "Updating…", className }: { label?: string; className?: string }) {
  return (
    <span
      role="status"
      aria-live="polite"
      className={cn(
        "nb-older-in inline-flex items-center gap-2 rounded-full border-[2px] border-[var(--nb-border-color)] bg-card py-1 pr-3 pl-1 shadow-[2px_2px_0_var(--nb-shadow-color)]",
        className
      )}
    >
      <span aria-hidden="true" className="inline-flex items-center gap-1 rounded-full border-[2px] border-[var(--nb-border-color)] bg-primary px-1.5 py-1">
        <span className="auth-dot !size-1.5" />
        <span className="auth-dot !size-1.5" />
        <span className="auth-dot !size-1.5" />
      </span>
      <span className="text-xs font-bold text-foreground">{label}</span>
    </span>
  );
}
