import axios from "axios";
axios.defaults.withCredentials = true;

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/echoShout`;

export const getEchoShoutsApi = async (page = 1, limit = 7) => {
  try {
    return await axios.get(`${API_URL}/messages?page=${page}&limit=${limit}`);
  } catch (error) {
    console.log(error);
  }
};

export const sendEchoShoutApi = async (message) => {
  try {
    return await axios.post(`${API_URL}/messages`, message, {
      headers: {
        "Content-Type": "application/form-data",
      },
    });
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const deleteAllMessagesInEchoShoutApi = async () => {
  try {
    return await axios.delete(`${API_URL}/messages`);
  } catch (error) {
    console.log(error);
  }
};
