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

export const sendWhisper = async (Data) => {
  try {
    const response = await axios.post(
      `${API_URL}/send-whisper`,
      Data,
      apiConfigJSON
    );
    return response;
  } catch (error) {
    console.log(error);
    return error;
  }
};
