import { sendEchoShoutApi } from "../../features/echoShout/api/echo_shout.api.js";
import { markLatestMessageAsReadApi } from "../../features/echoLink/api/echo_link.api";

export const handleKeyPress = (e, executableFunction) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    executableFunction();
  }
};

//these are used to scroll down automatically
export const scrollToBottom = (messagesEndRef) => {
  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
};

// Helper function to truncate message with ellipsis if it exceeds max length
export const truncateMessage = (message, maxLength = 30) => {
  return message?.length > maxLength
    ? message.slice(0, maxLength) + "..."
    : message;
};

// This function handle the toggle of the themes
export const handleToggle = (e, dispatch, setTheme, setIsChecked) => {
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

export const markAsRead = async (
  dispatch,
  setLatestMessageAsRead,
  currUser
) => {
  dispatch(setLatestMessageAsRead(currUser));

  try {
    await markLatestMessageAsReadApi(currUser?.uniqueChatId);
  } catch (error) {
    console.log(error);
  }
};

//to create a unique chat room for two users
export const createUniquechatRoom = (senderId, recieverId) => {
  return [senderId, recieverId].sort().join("-");
};

//to send a echoshout message
export const sendEchoShoutMessage = async (
  setSelectSearchBar,
  mentions,
  echoShoutMessageData,
  setMentions,
  setEchoShoutMessageData,
  setIsUploading
) => {
  setSelectSearchBar(false);
  if (mentions.length > 0) {
    echoShoutMessageData.append("mentions", JSON.stringify(mentions));
  }

  try {
    await sendEchoShoutApi(echoShoutMessageData);
  } catch (error) {
    console.log(error);
  } finally {
    setMentions([]);
    setEchoShoutMessageData("");
    setIsUploading(false);
  }
};
