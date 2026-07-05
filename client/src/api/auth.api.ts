import { api } from "@/lib/api";

export const registerApi = async (data: any) => {
  try {
    return await api.post("/api/auth/register", data);
  } catch (error) {
    console.error("Register Error:", error);
    throw error;
  }
};

export const loginApi = async (data: any) => {
  try {
    return await api.post("/api/auth/login", data);
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
};

export const logoutApi = async () => {
  try {
    return await api.post("/api/auth/logout");
  } catch (error) {
    console.error("Logout Error:", error);
    throw error;
  }
};

export const getProfileApi = async () => {
  try {
    return await api.get("/api/auth/profile");
  } catch (error) {
    console.error("Get Profile Error:", error);
    throw error;
  }
};
