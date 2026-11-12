"use client"

import { Bell, Check, TriangleAlert } from "lucide-react"

import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"

const BADGE = {
  success: { Icon: Check, className: "bg-nb-success" },
  destructive: { Icon: TriangleAlert, className: "bg-nb-danger" },
  default: { Icon: Bell, className: "bg-primary" },
} as const

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, duration, ...props }) {
        const badge = BADGE[variant ?? "default"]
        return (
          <Toast key={id} variant={variant} duration={duration} {...props}>
            <span
              aria-hidden="true"
              className={`nb-toast-badge flex size-10 shrink-0 items-center justify-center rounded-[10px] border-[3px] border-[var(--nb-border-color)] text-on-color shadow-[var(--nb-shadow-sm)] ${badge.className}`}
            >
              <badge.Icon className="size-5" strokeWidth={3} />
            </span>
            <div className="grid min-w-0 flex-1 gap-0.5 pt-0.5">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
              {action && (
                <div className="pt-2">
                  {typeof action === "object" && "label" in action ? (
                    <ToastAction altText={action.label} onClick={action.onClick}>
                      {action.label}
                    </ToastAction>
                  ) : (
                    action
                  )}
                </div>
              )}
            </div>
            <ToastClose />
            <span
              aria-hidden="true"
              className={`nb-toast-timer absolute inset-x-0 bottom-0 h-1.5 border-t-[2px] border-[var(--nb-border-color)] ${badge.className}`}
              style={{ animationDuration: `${duration ?? 4000}ms` }}
            />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
