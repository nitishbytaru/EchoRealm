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

export const sendMumbleApi = async (data: { message: string; receiver: string; isAnonymous: boolean }) => {
  try {
    return await api.post("/api/echoMumble/mumbles", data);
  } catch (error) {
    console.error("Send Mumble Error:", error);
    throw error;
  }
};

/**
 * Marks your received Mumbles as read. This is background work, so it retries
 * when the server times out (408) or is briefly unreachable, e.g. while the
 * hosted backend wakes up, before giving up.
 */
export const setMumblesAsReadApi = async (retries = 2) => {
  for (let attempt = 0; ; attempt++) {
    try {
      return await api.patch("/api/echoMumble/mumbles");
    } catch (error: any) {
      const status = error?.response?.status;
      const retryable = !error?.response || status === 408 || status === 429 || status >= 500;
      if (!retryable || attempt >= retries) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1500 * (attempt + 1)));
    }
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
