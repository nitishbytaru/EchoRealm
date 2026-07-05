import { useEffect, useRef, RefObject } from "react";
import { scrollToBottom } from "@/utils/helpers/micro_funcs";

export function useAutoScroll(dependency: any, shouldScroll: boolean = true): RefObject<HTMLDivElement | null> {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (dependency && shouldScroll) {
      scrollToBottom(messagesEndRef);
    }
  }, [dependency, shouldScroll]);

  return messagesEndRef;
}
