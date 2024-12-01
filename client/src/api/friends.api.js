import axios from "axios";
import { apiConfigJSON } from "./exportAPICONFIG.js";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/friends`;

export const sendFriendRequestApi = async (senderId) => {
  try {
    return await axios.get(`${API_URL}/send-request/${senderId}`, {
      withCredentials: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const fetchMyFriendRequestsApi = async () => {
  try {
    return await axios.get(`${API_URL}/friend-requests`, {
      withCredentials: true,
    });
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const getMyFriendsListApi = async () => {
  try {
    return await axios.get(`${API_URL}/friends-list`, {
      withCredentials: true,
    });
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const getBlockedUsersApi = async () => {
  try {
    return await axios.get(`${API_URL}/blocked-users`, apiConfigJSON);
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const unBlockUserApi = async (userId) => {
  try {
    return await axios.get(`${API_URL}/blocked-users/unblock/${userId}`, {
      withCredentials: true,
    });
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const handleFriendRequestApi = async (Data) => {
  try {
    return await axios.put(`${API_URL}/friend-request`, Data, apiConfigJSON);
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const handleRemoveOrBlockMyFriendApi = async (Data) => {
  try {
    return await axios.put(
      `${API_URL}/friends/remove-or-block`,
      Data,
      apiConfigJSON
    );
  } catch (error) {
    console.log(error);
    return error;
  }
};
