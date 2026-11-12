import { cn } from "@/lib/utils";

/** Small sticker that sits at the top of a chat log while older messages load. */
export default function OlderMessagesLoader({ label, className }: { label: string; className?: string }) {
  return (
    <div role="status" aria-live="polite" className={cn("pointer-events-none sticky top-2 z-10 flex justify-center pb-3", className)}>
      <span className="nb-older-in inline-flex items-center gap-2.5 rounded-full border-[2px] border-[var(--nb-border-color)] bg-card py-1.5 pr-3.5 pl-2 shadow-[2px_2px_0_var(--nb-shadow-color)]">
        <span aria-hidden="true" className="inline-flex items-center gap-1 rounded-full border-[2px] border-[var(--nb-border-color)] bg-primary px-2 py-1.5">
          <span className="auth-dot !size-1.5" />
          <span className="auth-dot !size-1.5" />
          <span className="auth-dot !size-1.5" />
        </span>
        <span className="text-xs font-bold text-foreground">{label}</span>
      </span>
    </div>
  );
}
