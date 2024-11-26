import axios from "axios";
import { apiConfigFORM } from "./exportAPICONFIG.js";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/echoShout`;

export const getEchoShoutsApi = async () => {
  try {
    return await axios.get(`${API_URL}/get-messages`, {
      withCredentials: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const sendEchoShoutApi = async (message) => {
  try {
    const response = await axios.post(
      `${API_URL}/send-message`,
      message,
      apiConfigFORM
    );
    return response;
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const deleteAllMessagesInEchoShoutApi = async () => {
  try {
    return await axios.delete(`${API_URL}/my-messages`, {
      withCredentials: true,
    });
  } catch (error) {
    console.log(error);
  }
};
