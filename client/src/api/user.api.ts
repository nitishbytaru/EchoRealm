import { api } from "@/lib/api";

export const fetchMostLikedMumbleWithLikesAndFriendsApi = async (userId: string) => {
  try {
    return await api.get(`/api/user/mumble/${userId}/likes-friends`);
  } catch (error) {
    console.error("Fetch Most Liked Mumbles Error:", error);
    throw error;
  }
};

export const searchUserByIdApi = async (userId: string) => {
  try {
    return await api.get(`/api/user/search/${userId}`);
  } catch (error) {
    console.error("Search User By Id Error:", error);
    throw error;
  }
};

export const searchUsersApi = async (username: string) => {
  try {
    return await api.get(`/api/user/search/username/${username}`);
  } catch (error) {
    console.error("Search Users Error:", error);
    throw error;
  }
};

export const getUsersWithMumbles = async (userId: string) => {
  try {
    return await api.get(`/api/user/user/${userId}`);
  } catch (error) {
    console.error("Get Users With Mumbles Error:", error);
    throw error;
  }
};

export const updateRequestApi = async (userNewData: FormData) => {
  try {
    return await api.patch("/api/user/user", userNewData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  } catch (error) {
    console.error("Update User Profile Error:", error);
    throw error;
  }
};

export const deleteMyAccountApi = async () => {
  try {
    return await api.delete("/api/user/account");
  } catch (error) {
    console.error("Delete Account Error:", error);
    throw error;
  }
};
