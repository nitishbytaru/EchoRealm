import axios from "axios";
axios.defaults.withCredentials = true;

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/friends`;

export const sendFriendRequestApi = async (senderId) => {
  try {
    return await axios.patch(`${API_URL}/requests/${senderId}`);
  } catch (error) {
    console.log(error);
  }
};

export const fetchMyFriendRequestsApi = async () => {
  try {
    return await axios.get(`${API_URL}/requests`);
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const getMyFriendsListApi = async () => {
  try {
    return await axios.get(`${API_URL}/friends`);
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const getBlockedUsersApi = async () => {
  try {
    return await axios.get(`${API_URL}/blockedUsers`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const unBlockUserApi = async (userId) => {
  try {
    return await axios.patch(`${API_URL}/blockedUsers/unblock/${userId}`);
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const handleFriendRequestApi = async (Data) => {
  try {
    return await axios.put(`${API_URL}/requests`, Data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const handleRemoveOrBlockMyFriendApi = async (Data) => {
  try {
    return await axios.put(`${API_URL}/remove-or-block`, Data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.log(error);
    return error;
  }
};
