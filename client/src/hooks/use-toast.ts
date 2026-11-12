"use client"

import * as React from "react"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

const TOAST_LIMIT = 5
// Time to keep a dismissed toast mounted so its exit animation can finish.
const TOAST_REMOVE_DELAY = 1000
const DEFAULT_DURATION = 4000
const ERROR_DURATION = 6000

export type ActionObject = {
  label: string
  onClick: () => void
}

type ToasterToast = Omit<ToastProps, "title" | "action"> & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement | ActionObject
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: string
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: string
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

interface ToastOptions {
  title?: React.ReactNode
  description?: React.ReactNode
  variant?: "default" | "success" | "destructive"
  duration?: number
  action?: ToastActionElement | ActionObject
}

export function toast(props: string | ToastOptions, options?: ToastOptions) {
  const toastProps = typeof props === "string" ? { description: props, ...options } : props

  // Don't stack an identical toast on top of one that's already showing.
  const existing = memoryState.toasts.find(
    (t) =>
      t.open !== false &&
      t.variant === toastProps.variant &&
      typeof toastProps.description === "string" &&
      t.description === toastProps.description
  )
  if (existing) {
    return {
      id: existing.id,
      dismiss: () => dispatch({ type: "DISMISS_TOAST", toastId: existing.id }),
      update: (next: ToasterToast) => dispatch({ type: "UPDATE_TOAST", toast: { ...next, id: existing.id } }),
    }
  }

  const id = genId()

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...toastProps,
      id,
      // Radix runs the timer, pausing it while the toast is hovered or focused.
      duration: toastProps.duration ?? (toastProps.variant === "destructive" ? ERROR_DURATION : DEFAULT_DURATION),
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id,
    dismiss,
    update,
  }
}

toast.success = (message: string) => {
  return toast({
    title: "Done!",
    description: message,
    variant: "success",
  })
}

toast.error = (message: string) => {
  return toast({
    title: "That didn't work",
    description: message,
    variant: "destructive",
  })
}

toast.dismiss = (toastId?: string) => {
  dispatch({ type: "DISMISS_TOAST", toastId })
}

export function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}
