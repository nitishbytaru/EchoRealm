import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-lg bg-zinc-850 dark:bg-zinc-900/60", className)}
      {...props}
    />
  )
}

export { Skeleton }
