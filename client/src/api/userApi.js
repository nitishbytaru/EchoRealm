import axios from "axios";
import { apiConfigJSON } from "./exportAPICONFIG.js";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/user`;

export const searchUsersApi = async (searchTerm) => {
  try {
    return await axios.get(`${API_URL}/search`, {
      params: { query: searchTerm },
      withCredentials: true,
    });
  } catch (error) {
    console.error("Error searching users:", error);
    return error;
  }
};

export const getSelectedUserByIdApi = async (selectedUserId) => {
  try {
    return await axios.get(`${API_URL}/get-selected-profile`, {
      ...apiConfigJSON,
      params: { selectedUserId },
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

export const getDetailsToViewProfileApi = async (
  selectedViewProfileId
) => {
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
