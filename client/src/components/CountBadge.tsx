import React from "react";
import { cn } from "@/lib/utils";

interface CountBadgeProps {
  count: number;
  label: string;
  className?: string;
}

export const CountBadge: React.FC<CountBadgeProps> = ({ count, label, className }) => {
  if (count <= 0) return null;
  return (
    <span
      className={cn(
        "absolute flex h-5 min-w-5 items-center justify-center rounded-full border-[2px] border-[var(--nb-border-color)] px-1 text-[11px] font-bold text-on-color",
        className
      )}
    >
      <span aria-hidden="true">{count > 99 ? "99+" : count}</span>
      <span className="sr-only">
        {count} {label}
      </span>
    </span>
  );
};

export default CountBadge;
