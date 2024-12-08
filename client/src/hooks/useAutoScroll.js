import { useEffect, useRef } from "react";
import { scrollToBottom } from "../utils/heplers/micro_funcs";

export function useAutoScroll(dependency) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (dependency) {
      scrollToBottom(messagesEndRef);
    }
  }, [dependency]);

  return messagesEndRef;
}
