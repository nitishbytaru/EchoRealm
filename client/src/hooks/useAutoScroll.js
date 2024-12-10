import { useEffect, useRef } from "react";
import { scrollToBottom } from "../utils/heplers/micro_funcs";

export function useAutoScroll(dependency, shouldScroll = true) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (dependency && shouldScroll) {
      scrollToBottom(messagesEndRef);
    }
  }, [dependency, shouldScroll]);

  return messagesEndRef;
}
