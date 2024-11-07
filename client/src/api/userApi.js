import axios from "axios";
import { apiConfigFORM, apiConfigJSON } from "./exportAPICONFIG.js";

const API_URL = "http://localhost:3000/api/user";

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
