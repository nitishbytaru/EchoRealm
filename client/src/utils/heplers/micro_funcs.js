import socket from "../../sockets/socket";
import { sendEchoShoutApi } from "../../features/echoShout/api/echo_shout.api.js";
import {
  getPrivateMessagesApi,
  markLatestMessageAsReadApi,
  getGroupChatDetailsApi,
} from "../../features/echoLink/api/echo_link.api";
import {
  removeFromChatRoomsWithUnreadMessages,
  setPrivateMessages,
} from "../../features/echoLink/slices/echo_link.slice.js";

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

// This function handles the room select i.e., if you select a user then it creates
// a unique room Id and fetches the any previous messages from that room
export const handleRoomSelect = async (dispatch, recieverId, user) => {
  const groupResponse = await getGroupChatDetailsApi(recieverId);
  const groupDetails = groupResponse?.data?.groupDetails;

  if (groupDetails) {
    const { _id, messages } = groupDetails;
    socket.emit("joinGroupChat", _id);

    dispatch(setPrivateMessages(messages));
  } else {
    //here logic for the joining of the private chat and the above code is for groupchat

    const uniqueRoomId = createUniquechatRoom(recieverId, user?._id);

    socket.emit("joinEchoLink", uniqueRoomId);
    dispatch(removeFromChatRoomsWithUnreadMessages(uniqueRoomId));

    const response = await getPrivateMessagesApi(uniqueRoomId);
    dispatch(setPrivateMessages(response?.data?.privateMessages?.messages));
  }
};

//this sets the message as read
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
  setEchoShoutMessageData
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
  }
};
