import axios from "axios";
import { apiConfigFORM, apiConfigJSON } from "./exportAPICONFIG.js";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/user`;

export const register = async (Data) => {
  try {
    return await axios.post(`${API_URL}/signin`, Data, apiConfigFORM);
  } catch (error) {
    console.log(error);
  }
};

export const login = async (Data) => {
  try {
    return await axios.post(`${API_URL}/login`, Data, apiConfigJSON);
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const getProfile = async () => {
  try {
    return await axios.get(`${API_URL}/get-profile`, {
      withCredentials: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const logout = async () => {
  try {
    return await axios.get(`${API_URL}/logout`, {
      withCredentials: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const blockSenderApi = async (whisperId, senderId) => {
  const data = {
    whisperId,
    senderId,
  };
  try {
    return await axios.post(`${API_URL}/block-user`, data, apiConfigJSON);
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const getBlockedUsers = async () => {
  try {
    return await axios.get(`${API_URL}/get-blockedUsers`, apiConfigJSON);
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const unBlockUser = async (userId) => {
  try {
    return await axios.get(`${API_URL}/un-block`, {
      ...apiConfigJSON,
      params: { userId },
    });
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const getSelectedUserProfileDetails = async (selectedViewProfileId) => {
  try {
    return await axios.get(`${API_URL}/get-selected-profile-details`, {
      ...apiConfigJSON,
      params: { selectedViewProfileId },
    });
  } catch (error) {
    console.log(error);
  }
};
