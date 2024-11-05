import axios from "axios";

const API_URL = "http://localhost:3000/api/user";

const apiConfigJSON = {
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  credentials: "include",
};

const apiConfigFORM = {
  withCredentials: true,
  headers: {
    "Content-Type": "application/form-data",
  },
  credentials: "include",
};

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
