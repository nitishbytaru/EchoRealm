import {
  getPrivateMessagesApi,
  markLatestMessageAsReadApi,
} from "../api/echoLinkApi";
import {
  removeFromChatRoomsWithUnreadMessages,
  setPrivateMessages,
} from "../app/slices/echoLinkSlice";
import socket from "../sockets/socket";

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

// This function handles the room select i.e., if you selecta user then it creates
// a unique room Id and fetches the any previous messages from that room
export const handleRoomSelect = async (dispatch, recieverId, user) => {
  //this functions is also in the backend if possible remove from one place
  const uniqueRoomId = createUniquechatRoom(recieverId, user?._id);

  socket.emit("joinEchoLink", uniqueRoomId);
  dispatch(removeFromChatRoomsWithUnreadMessages(uniqueRoomId));

  const response = await getPrivateMessagesApi(uniqueRoomId);
  dispatch(setPrivateMessages(response?.data?.privateMessages?.messages));
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
