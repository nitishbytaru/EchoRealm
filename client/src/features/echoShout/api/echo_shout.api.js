import axios from "axios";
axios.defaults.withCredentials = true;

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/echoShout`;

export const getEchoShoutsApi = async () => {
  try {
    return await axios.get(`${API_URL}/messages`);
  } catch (error) {
    console.log(error);
  }
};

export const sendEchoShoutApi = async (message) => {
  try {
    const response = await axios.post(`${API_URL}/messages`, message, {
      headers: {
        "Content-Type": "application/form-data",
      },
    });
    return response;
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
