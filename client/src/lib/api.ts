import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
