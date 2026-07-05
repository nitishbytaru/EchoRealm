import { api } from "@/lib/api";

export const getEchoShoutsApi = async (page = 1, limit = 7) => {
  try {
    return await api.get(`/api/echoShout/messages?page=${page}&limit=${limit}`);
  } catch (error) {
    console.error("Get Echo Shouts Error:", error);
    throw error;
  }
};

export const sendEchoShoutApi = async (message: FormData) => {
  try {
    return await api.post("/api/echoShout/messages", message, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  } catch (error) {
    console.error("Send Echo Shout Error:", error);
    throw error;
  }
};

export const deleteAllMessagesInEchoShoutApi = async () => {
  try {
    return await api.delete("/api/echoShout/messages");
  } catch (error) {
    console.error("Delete All Shout Messages Error:", error);
    throw error;
  }
};
