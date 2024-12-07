import axios from "axios";
import { apiConfigFORM, apiConfigJSON } from "./exportAPICONFIG.js";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/echoLink`;

export const sendEchoLinkMessageApi = async (echoLinkMessage) => {
  try {
    return await axios.post(
      `${API_URL}/message`,
      echoLinkMessage,
      apiConfigFORM
    );
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const getMyPrivateFriendsApi = async () => {
  try {
    return await axios.get(`${API_URL}/friends/private`, {
      withCredentials: true,
    });
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const getPrivateMessagesApi = async (uniqueChatId) => {
  try {
    return await axios.get(`${API_URL}/messages/${uniqueChatId}`, {
      withCredentials: true,
    });
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const markLatestMessageAsReadApi = async (uniqueChatId) => {
  try {
    await axios.get(`${API_URL}/messages/${uniqueChatId}/read`, {
      withCredentials: true,
    });
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const searchEchoLinkFriendsApi = async (searchTerm) => {
  try {
    const { data } = await axios.get(
      `${API_URL}/friends/search/${searchTerm}`,
      {
        withCredentials: true,
      }
    );
    return data?.searchedUsers;
  } catch (error) {
    console.log(error);
  }
};

export const handleDeleteAllEchoLinkApi = async () => {
  try {
    return await axios.delete(`${API_URL}/chatRooms`, apiConfigJSON);
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const clearChatApi = async (uniqueChatId) => {
  try {
    return await axios.delete(
      `${API_URL}/chats/${uniqueChatId}`,
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
      `${API_URL}/chatRoom/${uniqueChatId}`,
      apiConfigJSON
    );
  } catch (error) {
    console.log(error);
    return error;
  }
};

//for group chat
export const createGroupChatApi = async (Data) => {
  try {
    return await axios.post(`${API_URL}/groupChat/create`, Data, apiConfigFORM);
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const getGroupChatDetailsApi = async (groupId) => {
  try {
    return await axios.get(`${API_URL}/groupChat/${groupId}`, {
      withCredentials: true,
    });
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const sendGroupChatMessageApi = async (echoLinkMessage) => {
  try {
    return await axios.post(
      `${API_URL}/groupChat/messages/send`,
      echoLinkMessage,
      apiConfigFORM
    );
  } catch (error) {
    console.log(error);
    return error;
  }
};
