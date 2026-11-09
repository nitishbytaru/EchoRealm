import { KeyboardEvent, RefObject } from "react";
import { sendEchoShoutApi } from "@/api/echo_shout.api";
import { markLatestMessageAsReadApi } from "@/api/echo_link.api";

export const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>, executableFunction: () => void) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    executableFunction();
  }
};

//these are used to scroll down automatically
export const scrollToBottom = (messagesEndRef: RefObject<HTMLElement | null>) => {
  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
};

// Helper function to truncate message with ellipsis if it exceeds max length
export const truncateMessage = (message?: string, maxLength: number = 30): string => {
  if (!message) return "";
  return message.length > maxLength
    ? message.slice(0, maxLength) + "..."
    : message;
};

// This function handle the toggle of the themes
export const handleToggle = (
  e: React.ChangeEvent<HTMLInputElement>,
  dispatch: any,
  setTheme: any,
  setIsChecked: any
) => {
  if (e.target.checked) {
    dispatch(setTheme("business"));
    localStorage.setItem("theme", "business");
    dispatch(setIsChecked(true));
  } else {
    dispatch(setTheme("wireframe"));
    localStorage.setItem("theme", "wireframe");
    dispatch(setIsChecked(false));
  }
};

//to create a unique chat room for two users
export const createUniquechatRoom = (senderId: string, recieverId: string): string => {
  return [senderId, recieverId].sort().join("-");
};

// send an EchoShout post; rejects so the composer can restore the message
export const sendEchoShoutMessage = async (mentions: any[], data: FormData) => {
  if (mentions.length > 0) {
    data.append("mentions", JSON.stringify(mentions));
  }
  await sendEchoShoutApi(data);
};

// to mark the latest message as read
export const markAsRead = async (
  dispatch: any,
  setLatestMessageAsRead: any,
  receiver: any
) => {
  try {
    const uniqueChatId = receiver?.uniqueChatId;
    if (!uniqueChatId) return;

    await markLatestMessageAsReadApi(uniqueChatId);
    dispatch(setLatestMessageAsRead(receiver));
  } catch (error) {
    console.error("Error marking message as read:", error);
  }
};
