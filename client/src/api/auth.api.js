import axios from "axios";
axios.defaults.withCredentials = true;

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/auth`;

export const registerApi = async (Data) => {
  try {
    return await axios.post(`${API_URL}/register`, Data, {
      headers: {
        "Content-Type": "application/form-data",
      },
    });
  } catch (error) {
    console.log(error);
  }
};

export const loginApi = async (Data) => {
  try {
    return await axios.post(`${API_URL}/login`, Data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const logoutApi = async () => {
  try {
    return await axios.post(`${API_URL}/logout`);
  } catch (error) {
    console.log(error);
  }
};

export const getProfileApi = async () => {
  try {
    return await axios.get(`${API_URL}/profile`);
  } catch (error) {
    console.log(error);
  }
};
