"use client";

import { cn } from "@/lib/utils";

interface StickerSwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  /** Accessible name, e.g. "Become anonymous". */
  label: string;
  /** Icon shown on the knob when on / off. */
  onIcon: React.ReactNode;
  offIcon: React.ReactNode;
  /** Tailwind background class for the track when on. */
  onFill?: string;
  id?: string;
}

/** A chunky neo-brutalist switch: the knob is a small sticker carrying an icon, and it bounces across. */
export default function StickerSwitch({
  checked,
  onCheckedChange,
  label,
  onIcon,
  offIcon,
  onFill = "bg-nb-accent",
  id,
}: StickerSwitchProps) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "nb-switch relative inline-flex h-9 w-[4.25rem] shrink-0 items-center rounded-full border-2 border-[var(--nb-border-color)] shadow-[2px_2px_0_var(--nb-shadow-color)] transition-colors duration-300",
        checked ? onFill : "bg-muted"
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute text-[0.6rem] font-extrabold tracking-wide transition-opacity duration-200",
          checked ? "left-2.5 text-on-color opacity-100" : "right-2 text-muted-foreground opacity-100"
        )}
      >
        {checked ? "ON" : "OFF"}
      </span>
      <span
        aria-hidden="true"
        className={cn(
          "nb-switch-knob absolute top-0.5 left-0.5 flex size-7 items-center justify-center rounded-full border-2 border-[var(--nb-border-color)] bg-card text-foreground",
          checked && "translate-x-[2.15rem]"
        )}
      >
        <span key={String(checked)} className="nb-switch-icon flex">
          {checked ? onIcon : offIcon}
        </span>
      </span>
    </button>
  );
}
