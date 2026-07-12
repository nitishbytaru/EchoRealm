import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-2xl text-sm font-bold whitespace-nowrap transition-all duration-150 ease-out outline-none select-none border-[3px] border-[var(--nb-border-color)] focus-visible:ring-3 focus-visible:ring-ring/50 hover:-translate-y-0.5 hover:shadow-[var(--nb-shadow-hover)] active:translate-y-0.5 active:shadow-[var(--nb-shadow-active)] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-[var(--nb-shadow-sm)]",
        outline:
          "bg-card text-foreground shadow-[var(--nb-shadow-sm)] hover:bg-muted",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[var(--nb-shadow-sm)]",
        ghost:
          "border-transparent shadow-none hover:bg-muted hover:border-[var(--nb-border-color)] hover:shadow-[var(--nb-shadow-sm)]",
        destructive:
          "bg-destructive text-white shadow-[var(--nb-shadow-sm)]",
        link: "text-primary border-transparent shadow-none underline-offset-4 hover:underline hover:shadow-none hover:translate-y-0",
      },
      size: {
        default:
          "h-10 gap-2 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-7 gap-1 rounded-xl px-2.5 text-xs has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-xl px-3 text-[0.8rem] has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-11 gap-2 px-5 text-base has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        icon: "size-10",
        "icon-xs":
          "size-7 rounded-xl [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-8 rounded-xl",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface ButtonProps extends ButtonPrimitive.Props, VariantProps<typeof buttonVariants> {
  loading?: boolean
}

function Button({
  className,
  variant = "default",
  size = "default",
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      data-variant={variant}
      disabled={disabled || loading}
      className={cn(buttonVariants({ variant, size, className }), loading && "relative text-transparent! select-none")}
      {...props}
    >
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center text-current">
          <Loader2 className="h-4 w-4 animate-spin text-current" />
        </span>
      )}
      {children}
    </ButtonPrimitive>
  )
}

export { Button, buttonVariants }
