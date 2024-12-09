import axios from "axios";
axios.defaults.withCredentials = true;

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/user`;

export const fetchMostLikedMumbleWithLikesAndFriendsApi = async (userId) => {
  try {
    return await axios.get(`${API_URL}/mumble/${userId}/likes-friends`);
  } catch (error) {
    console.error("Error searching users:", error);
    return error;
  }
};

export const searchUserByIdApi = async (userId) => {
  try {
    return await axios.get(`${API_URL}/search/${userId}`);
  } catch (error) {
    console.error("Error searching users:", error);
    return error;
  }
};

export const searchUsersApi = async (username) => {
  try {
    return await axios.get(`${API_URL}/search/${username}`);
  } catch (error) {
    console.error("Error searching users:", error);
    return error;
  }
};

export const getUsersWithMumbles = async (userId) => {
  try {
    return await axios.get(`${API_URL}/user/${userId}`);
  } catch (error) {
    console.log(error);
  }
};

export const updateRequestApi = async (userNewData) => {
  try {
    return await axios.patch(`${API_URL}/user`, userNewData, {
      headers: {
        "Content-Type": "application/form-data",
      },
    });
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const deleteMyAccountApi = async () => {
  try {
    return await axios.delete(`${API_URL}/account`);
  } catch (error) {
    console.log(error);
  }
};
