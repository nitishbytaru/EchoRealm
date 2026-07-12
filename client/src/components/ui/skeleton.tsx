import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-xl bg-muted border-[2px] border-[var(--nb-border-color)]", className)}
      {...props}
    />
  )
}

export { Skeleton }
