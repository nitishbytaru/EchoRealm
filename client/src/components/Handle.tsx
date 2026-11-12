import { cn } from "@/lib/utils";

type HandleSize = "xs" | "sm" | "md" | "xl";

const SIZES: Record<HandleSize, string> = {
  xs: "text-xs font-bold",
  sm: "text-sm font-extrabold",
  md: "text-sm font-extrabold",
  xl: "text-2xl font-extrabold tracking-tight sm:text-3xl",
};

interface HandleProps {
  name: string;
  size?: HandleSize;
  className?: string;
}

/** A username as a plain handle: a soft "@" followed by the name in bold. */
export default function Handle({ name, size = "sm", className }: HandleProps) {
  return (
    <span className={cn("inline-flex min-w-0 items-baseline", SIZES[size], className)}>
      <span className="shrink-0 font-semibold opacity-55">@</span>
      <span className="min-w-0 truncate">{name}</span>
    </span>
  );
}
