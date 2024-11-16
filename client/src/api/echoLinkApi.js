import axios from "axios";
import { apiConfigFORM, apiConfigJSON } from "./exportAPICONFIG.js";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/echoLink`;

export const getMyPrivateFriends = async () => {
  try {
    return await axios.get(`${API_URL}/get-myPrivateFriends`, {
      withCredentials: true,
    });
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const sendEchoLinkMessage = async (echoLinkMessage) => {
  try {
    return await axios.post(
      `${API_URL}/send-echoLinkMessage`,
      echoLinkMessage,
      apiConfigFORM
    );
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const getPrivateMessages = async (uniqueChatId) => {
  try {
    return await axios.get(`${API_URL}/get-privateMessages`, {
      params: { uniqueChatId },
      ...apiConfigJSON,
    });
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const markLatestMessageAsRead = async (uniqueChatId) => {
  try {
    await axios.get(`${API_URL}/set-latestMessageAsRead`, {
      params: { uniqueChatId },
      ...apiConfigJSON,
    });
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const handleDeleteAllEchoLinkApi = async () => {
  try {
    return await axios.get(`${API_URL}/delete-all-chat-rooms`, apiConfigJSON);
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const clearChatApi = async (uniqueChatId) => {
  console.log(uniqueChatId);
  try {
    return await axios.delete(
      `${API_URL}/delete-chat/${uniqueChatId}`,
      apiConfigJSON
    );
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const deleteChatRoomApi = async (uniqueChatId) => {
  try {
    return await axios.delete(
      `${API_URL}/delete-chat-room/${uniqueChatId}`,
      apiConfigJSON
    );
  } catch (error) {
    console.log(error);
    return error;
  }
};
