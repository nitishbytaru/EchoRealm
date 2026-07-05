import { api } from "@/lib/api";

export const getMumblesApi = async () => {
  try {
    return await api.get("/api/echoMumble/mumbles");
  } catch (error) {
    console.error("Get Mumbles Error:", error);
    throw error;
  }
};

export const pinMumbleApi = async (mumbleId: string) => {
  try {
    return await api.patch(`/api/echoMumble/pin/${mumbleId}`);
  } catch (error) {
    console.error("Pin Mumble Error:", error);
    throw error;
  }
};

export const likeThisMumbleApi = async (mumbleId: string) => {
  try {
    return await api.patch(`/api/echoMumble/like/${mumbleId}`);
  } catch (error) {
    console.error("Like Mumble Error:", error);
    throw error;
  }
};

export const sendMumbleApi = async (data: { message: string; receiver: string; sender: string | null }) => {
  try {
    return await api.post("/api/echoMumble/mumbles", data);
  } catch (error) {
    console.error("Send Mumble Error:", error);
    throw error;
  }
};

export const setMumblesAsReadApi = async () => {
  try {
    return await api.patch("/api/echoMumble/mumbles");
  } catch (error) {
    console.error("Set Mumbles As Read Error:", error);
    throw error;
  }
};

export const deleteMumbleApi = async (mumbleId: string) => {
  try {
    return await api.delete(`/api/echoMumble/${mumbleId}`);
  } catch (error) {
    console.error("Delete Mumble Error:", error);
    throw error;
  }
};

export const deleteAllRecievedMumblesApi = async () => {
  try {
    return await api.delete("/api/echoMumble/recieved");
  } catch (error) {
    console.error("Delete All Received Mumbles Error:", error);
    throw error;
  }
};

export const deleteAllSentMumblesApi = async () => {
  try {
    return await api.delete("/api/echoMumble/sent");
  } catch (error) {
    console.error("Delete All Sent Mumbles Error:", error);
    throw error;
  }
};
