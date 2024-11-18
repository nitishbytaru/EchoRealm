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

export const getSelectedUserById = async (selectedUserId) => {
  try {
    return await axios.get(`${API_URL}/get-selected-profile`, {
      ...apiConfigJSON,
      params: { selectedUserId },
    });
  } catch (error) {
    console.log(error);
  }
};

export const sendFriendRequestApi = async (selectedUserId) => {
  try {
    return await axios.get(`${API_URL}/send-friend-request`, {
      ...apiConfigJSON,
      params: { selectedUserId },
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

export const updateRequestApi = async (userNewData) => {
  try {
    return await axios.post(
      `${API_URL}/update-userdata`,
      userNewData,
      apiConfigJSON
    );
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const fetchMyFriendRequestsApi = async () => {
  try {
    return await axios.get(`${API_URL}/get-myFriendRequests`, apiConfigJSON);
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const handleFriendRequestApi = async (Data) => {
  try {
    return await axios.post(
      `${API_URL}/handle-friendRequest`,
      Data,
      apiConfigJSON
    );
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const handleRemoveOrBlockMyFriendApi = async (Data) => {
  try {
    return await axios.post(
      `${API_URL}/remove-block-MyFriend`,
      Data,
      apiConfigJSON
    );
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const blockSenderApi = async (senderId) => {
  try {
    return await axios.get(`${API_URL}/block-user`, {
      ...apiConfigJSON,
      params: { senderId },
    });
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

export const deleteMyAccountApi = async () => {
  try {
    return await axios.get(`${API_URL}/delete-my-account`, {
      withCredentials: true,
    });
  } catch (error) {
    console.log(error);
  }
};
