import axios from "axios";
import { apiConfigJSON } from "./exportAPICONFIG.js";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/echoMumble`;

export const searchUsersApi = async (searchTerm) => {
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

export const sendMumbleApi = async (whiperData) => {
  try {
    return await axios.post(
      `${API_URL}/send-Mumble`,
      whiperData,
      apiConfigJSON
    );
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const getMumblesApi = async () => {
  try {
    return await axios.get(`${API_URL}/get-Mumbles`, {
      withCredentials: true,
    });
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const deleteMumbleApi = async (MumbleId) => {
  try {
    return await axios.delete(`${API_URL}/delete-Mumble`, {
      ...apiConfigJSON,
      params: { MumbleId },
    });
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const pinMumbleApi = async (MumbleId) => {
  try {
    return await axios.get(`${API_URL}/pin-Mumble`, {
      ...apiConfigJSON,
      params: { MumbleId },
    });
  } catch (error) {
    console.log(error);
    return error?.response;
  }
};

export const likeThisMumbleApi = async (MumbleId) => {
  try {
    return await axios.get(`${API_URL}/like-Mumble`, {
      ...apiConfigJSON,
      params: { MumbleId },
    });
  } catch (error) {
    console.log(error);
    return error?.response;
  }
};

// From here all the apis are used to delete the data
export const deleteAllRecievedMumblesApi = async () => {
  try {
    return await axios.get(
      `${API_URL}/delete-recieved-Mumbles`,
      apiConfigJSON
    );
  } catch (error) {
    console.log(error);
    return error?.response;
  }
};

export const deleteAllSentMumblesApi = async () => {
  try {
    return await axios.get(
      `${API_URL}/delete-sent-Mumbles`,
      apiConfigJSON
    );
  } catch (error) {
    console.log(error);
    return error?.response;
  }
};