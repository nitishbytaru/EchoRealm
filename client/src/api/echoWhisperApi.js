import axios from "axios";
import { apiConfigJSON } from "./exportAPICONFIG.js";

const API_URL = "http://localhost:3000/api/echoWhisper";

export const searchUsers = async (searchTerm) => {
  try {
    const response = await axios.get(`${API_URL}/search`, {
      params: { query: searchTerm },
      withCredentials: true,
    });
    return response?.data?.searchedUsers;
  } catch (error) {
    console.error("Error searching users:", error);
    return error;
  }
};

export const sendWhisper = async (whiperData) => {
  try {
    return await axios.post(
      `${API_URL}/send-whisper`,
      whiperData,
      apiConfigJSON
    );
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const getWhispers = async () => {
  try {
    return await axios.get(`${API_URL}/get-whispers`, {
      withCredentials: true,
    });
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const deleteWhisper = async (whisperId) => {
  try {
    return await axios.delete(`${API_URL}/delete-whisper`, {
      ...apiConfigJSON,
      params: { whisperId },
    });
  } catch (error) {
    console.log(error);
    return error;
  }
};
