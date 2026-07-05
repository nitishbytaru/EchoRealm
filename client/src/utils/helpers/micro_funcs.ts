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

//to send a echoshout message
export const sendEchoShoutMessage = async (
  setSelectSearchBar: (val: boolean) => void,
  mentions: any[],
  echoShoutMessageData: FormData,
  setMentions: (val: any[]) => void,
  setEchoShoutMessageData: (val: any) => void,
  setIsUploading: (val: boolean) => void
) => {
  setSelectSearchBar(false);
  if (mentions.length > 0) {
    echoShoutMessageData.append("mentions", JSON.stringify(mentions));
  }

  try {
    await sendEchoShoutApi(echoShoutMessageData);
  } catch (error) {
    console.error("Error sending shout:", error);
  } finally {
    setMentions([]);
    setEchoShoutMessageData("");
    setIsUploading(false);
  }
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
