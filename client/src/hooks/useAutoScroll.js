import { useEffect, useRef } from "react";
import { scrollToBottom } from "../heplerFunc/microFuncs";

export function useAutoScroll(dependency) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (dependency) {
      scrollToBottom(messagesEndRef);
    }
  }, [dependency]);

  return messagesEndRef;
}
