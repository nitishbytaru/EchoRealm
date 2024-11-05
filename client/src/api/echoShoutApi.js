import axios from "axios";

const API_URL = "http://localhost:3000/api/echoShout";

const apiConfigFORM = {
  withCredentials: true,
  headers: {
    "Content-Type": "application/form-data",
  },
  credentials: "include",
};

export const sendMessage = async (Data) => {
  try {
    const response = await axios.post(
      `${API_URL}/send-message`,
      Data,
      apiConfigFORM
    );
    return response;
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const getMessages = async () => {
  try {
    return await axios.get(`${API_URL}/get-messages`, {
      withCredentials: true,
    });
  } catch (error) {
    console.log(error);
  }
};
