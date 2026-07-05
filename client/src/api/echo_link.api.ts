import { api } from "@/lib/api";

export const sendEchoLinkMessageApi = async (echoLinkMessage: FormData) => {
  try {
    return await api.post("/api/echoLink/messages", echoLinkMessage, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  } catch (error) {
    console.error("Send Echo Link Message Error:", error);
    throw error;
  }
};

export const getMyPrivateFriendsApi = async () => {
  try {
    return await api.get("/api/echoLink/friends/private");
  } catch (error) {
    console.error("Get My Private Friends Error:", error);
    throw error;
  }
};

export const getPrivateMessagesApi = async (
  uniqueChatId: string,
  page = 1,
  limit = 7
) => {
  try {
    return await api.get(
      `/api/echoLink/messages/${uniqueChatId}?page=${page}&limit=${limit}`
    );
  } catch (error) {
    console.error("Get Private Messages Error:", error);
    throw error;
  }
};

export const markLatestMessageAsReadApi = async (uniqueChatId: string) => {
  try {
    return await api.patch(`/api/echoLink/messages/${uniqueChatId}`);
  } catch (error) {
    console.error("Mark Latest Message As Read Error:", error);
    throw error;
  }
};

export const searchEchoLinkFriendsApi = async (searchTerm: string) => {
  try {
    const { data } = await api.get(`/api/echoLink/friends/search/${searchTerm}`);
    return data?.searchedUsers;
  } catch (error) {
    console.error("Search Echo Link Friends Error:", error);
    throw error;
  }
};

export const handleDeleteAllEchoLinkApi = async () => {
  try {
    return await api.delete("/api/echoLink/chatRooms");
  } catch (error) {
    console.error("Delete All Echo Link Error:", error);
    throw error;
  }
};

export const clearChatApi = async (uniqueChatId: string) => {
  try {
    return await api.delete(`/api/echoLink/chats/${uniqueChatId}`);
  } catch (error) {
    console.error("Clear Chat Error:", error);
    throw error;
  }
};

export const deleteChatRoomApi = async (uniqueChatId: string) => {
  try {
    return await api.delete(`/api/echoLink/chatRoom/${uniqueChatId}`);
  } catch (error) {
    console.error("Delete Chat Room Error:", error);
    throw error;
  }
};

// For group chat
export const createGroupChatApi = async (data: FormData) => {
  try {
    return await api.post("/api/echoLink/groupChat/create", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  } catch (error) {
    console.error("Create Group Chat Error:", error);
    throw error;
  }
};

export const getGroupChatDetailsApi = async (groupId: string) => {
  try {
    return await api.get(`/api/echoLink/groupChat/${groupId}`);
  } catch (error) {
    console.error("Get Group Chat Details Error:", error);
    throw error;
  }
};

export const sendGroupChatMessageApi = async (echoLinkMessage: FormData) => {
  try {
    return await api.post(
      "/api/echoLink/groupChat/messages/send",
      echoLinkMessage,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  } catch (error) {
    console.error("Send Group Chat Message Error:", error);
    throw error;
  }
};

export const leaveFromGroupChatApi = async (groupId: string) => {
  try {
    return await api.patch(`/api/echoLink/groupChat/${groupId}/leave`);
  } catch (error) {
    console.error("Leave Group Chat Error:", error);
    throw error;
  }
};

export const updateMembersInGroupApi = async ({
  groupId,
  groupMembers,
}: {
  groupId: string;
  groupMembers: any;
}) => {
  try {
    return await api.patch(
      `/api/echoLink/groupChat/${groupId}/members`,
      groupMembers
    );
  } catch (error) {
    console.error("Update Group Members Error:", error);
    throw error;
  }
};
