import axios from "axios";
axios.defaults.withCredentials = true;

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/echoLink`;

export const sendEchoLinkMessageApi = async (echoLinkMessage) => {
  try {
    return await axios.post(`${API_URL}/message`, echoLinkMessage, {
      headers: {
        "Content-Type": "application/form-data",
      },
    });
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const getMyPrivateFriendsApi = async () => {
  try {
    return await axios.get(`${API_URL}/friends/private`);
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const getPrivateMessagesApi = async (uniqueChatId) => {
  try {
    return await axios.get(`${API_URL}/messages/${uniqueChatId}`);
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const markLatestMessageAsReadApi = async (uniqueChatId) => {
  try {
    await axios.get(`${API_URL}/messages/${uniqueChatId}/read`);
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const searchEchoLinkFriendsApi = async (searchTerm) => {
  try {
    const { data } = await axios.get(`${API_URL}/friends/search/${searchTerm}`);
    return data?.searchedUsers;
  } catch (error) {
    console.log(error);
  }
};

export const handleDeleteAllEchoLinkApi = async () => {
  try {
    return await axios.delete(`${API_URL}/chatRooms`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const clearChatApi = async (uniqueChatId) => {
  try {
    return await axios.delete(`${API_URL}/chats/${uniqueChatId}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const deleteChatRoomApi = async (uniqueChatId) => {
  try {
    return await axios.delete(`${API_URL}/chatRoom/${uniqueChatId}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.log(error);
    return error;
  }
};

//for group chat
export const createGroupChatApi = async (Data) => {
  try {
    return await axios.post(`${API_URL}/groupChat/create`, Data, {
      headers: {
        "Content-Type": "application/form-data",
      },
    });
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const getGroupChatDetailsApi = async (groupId) => {
  try {
    return await axios.get(`${API_URL}/groupChat/${groupId}`);
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const sendGroupChatMessageApi = async (echoLinkMessage) => {
  try {
    return await axios.post(
      `${API_URL}/groupChat/messages/send`,
      echoLinkMessage,
      {
        headers: {
          "Content-Type": "application/form-data",
        },
      }
    );
  } catch (error) {
    console.log(error);
    return error;
  }
};
