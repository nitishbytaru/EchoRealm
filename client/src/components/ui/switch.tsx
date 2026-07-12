"use client"

import { Switch as SwitchPrimitive } from "@base-ui/react/switch"

import { cn } from "@/lib/utils"

function Switch({
  className,
  size = "default",
  ...props
}: SwitchPrimitive.Root.Props & {
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 items-center rounded-full border-[3px] border-[var(--nb-border-color)] transition-colors duration-150 ease-out outline-none focus-visible:ring-3 focus-visible:ring-ring/50 data-[size=default]:h-[24px] data-[size=default]:w-[44px] data-[size=sm]:h-[18px] data-[size=sm]:w-[32px] data-checked:bg-primary data-unchecked:bg-muted hover:data-unchecked:bg-muted/80 data-disabled:cursor-not-allowed data-disabled:opacity-50 shadow-[2px_2px_0px_var(--nb-shadow-color)]",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block rounded-full bg-card border-[2px] border-[var(--nb-border-color)] transition-transform duration-150 ease-out group-data-[size=default]/switch:size-[14px] group-data-[size=sm]/switch:size-[10px] group-data-[size=default]/switch:data-checked:translate-x-[20px] group-data-[size=sm]/switch:data-checked:translate-x-[12px] group-data-[size=default]/switch:data-unchecked:translate-x-[2px] group-data-[size=sm]/switch:data-unchecked:translate-x-[1px]"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
