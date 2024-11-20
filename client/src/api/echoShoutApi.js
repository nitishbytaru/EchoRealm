import axios from "axios";
import { apiConfigFORM } from "./exportAPICONFIG.js";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/echoShout`;

export const sendEchoShoutApi = async (Data) => {
  try {
    const response = await axios.post(
      `${API_URL}/send-echoShoutMessage`,
      Data,
      apiConfigFORM
    );
    return response;
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const getEchoShoutsApi = async () => {
  try {
    return await axios.get(`${API_URL}/get-echoShoutMessages`, {
      withCredentials: true,
    });
  } catch (error) {
    console.log(error);
  }
};

// From here all the apis are used to delete the data
export const deleteAllMessagesInEchoShoutApi = async () => {
  try {
    return await axios.get(`${API_URL}/delete-my-messages`, {
      withCredentials: true,
    });
  } catch (error) {
    console.log(error);
  }
};
