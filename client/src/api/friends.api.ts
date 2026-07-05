import { api } from "@/lib/api";

export const sendFriendRequestApi = async (senderId: string) => {
  try {
    return await api.patch(`/api/friends/requests/${senderId}`);
  } catch (error) {
    console.error("Send Friend Request Error:", error);
    throw error;
  }
};

export const fetchMyFriendRequestsApi = async () => {
  try {
    return await api.get("/api/friends/requests");
  } catch (error) {
    console.error("Fetch My Friend Requests Error:", error);
    throw error;
  }
};

export const getMyFriendsListApi = async () => {
  try {
    return await api.get("/api/friends");
  } catch (error) {
    console.error("Get My Friends List Error:", error);
    throw error;
  }
};

export const getBlockedUsersApi = async () => {
  try {
    return await api.get("/api/friends/blockedUsers");
  } catch (error) {
    console.error("Get Blocked Users Error:", error);
    throw error;
  }
};

export const unBlockUserApi = async (userId: string) => {
  try {
    return await api.patch(`/api/friends/blockedUsers/unblock/${userId}`);
  } catch (error) {
    console.error("Unblock User Error:", error);
    throw error;
  }
};

export const handleFriendRequestApi = async (data: { senderId: string; action: "accept" | "reject" }) => {
  try {
    return await api.put("/api/friends/requests", data);
  } catch (error) {
    console.error("Handle Friend Request Error:", error);
    throw error;
  }
};

export const handleRemoveOrBlockMyFriendApi = async (data: { friendId: string; action: "remove" | "block" }) => {
  try {
    return await api.put("/api/friends/remove-or-block", data);
  } catch (error) {
    console.error("Handle Remove/Block Friend Error:", error);
    throw error;
  }
};
