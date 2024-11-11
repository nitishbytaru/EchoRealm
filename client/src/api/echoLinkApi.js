import axios from "axios";
import { apiConfigFORM, apiConfigJSON } from "./exportAPICONFIG.js";

const API_URL = "http://localhost:3000/api/echoLink";

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
    const response = await axios.get(`${API_URL}/set-latestMessageAsRead`, {
      params: { uniqueChatId },
      ...apiConfigJSON,
    });
  } catch (error) {
    console.log(error);
    return error;
  }
};
