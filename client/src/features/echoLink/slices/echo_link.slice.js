import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  pagination: {},
  selectedChat: {},
  privateMessages: [],
  newUnreadMessages: 0,
  myPrivateChatRooms: [],
  chatRoomsWithUnreadMessages: [],
};

const echoLinkSlice = createSlice({
  name: "echoLink",
  initialState,
  reducers: {
    setSelectedChat(state, action) {
      state.selectedChat = action.payload;
    },
    addPrivateMessage(state, action) {
      if (!state.privateMessages) {
        state.privateMessages = [];
      }
      state.privateMessages.push(action.payload);
    },
    setPrivateMessages(state, action) {
      state.privateMessages = action.payload;
    },
    setMyPrivateChatRooms(state, action) {
      state.myPrivateChatRooms = action.payload;
    },
    addToMyPrivateChatRooms(state, action) {
      const existingChatRoom = state.myPrivateChatRooms.find((friend) => {
        return friend.uniqueChatId === action.payload.uniqueChatId;
      });
      if (existingChatRoom) {
        existingChatRoom.latestMessage = action.payload.latestMessage;
      } else {
        state.myPrivateChatRooms.push(action.payload);
      }

      state.myPrivateChatRooms = state.myPrivateChatRooms.sort((a, b) => {
        const dateA = new Date(
          a.latestMessage?.updatedAt || a.newGroupChatDetails?.updatedAt
        );
        const dateB = new Date(
          b.latestMessage?.updatedAt || b.newGroupChatDetails?.updatedAt
        );
        return dateB - dateA; // Sort in descending order
      });
    },
    removeFromMyPrivateChatRooms(state, action) {
      state.myPrivateChatRooms = state.myPrivateChatRooms.filter(
        (friend) => friend.uniqueChatId !== action.payload
      );
    },
    setLatestMessageAsRead(state, action) {
      const chatId = action.payload?._id;

      state.myPrivateChatRooms = state.myPrivateChatRooms.map((chatRoom) => {
        if (chatRoom._id === chatId) {
          const updatedChatRoom = { ...chatRoom };
          updatedChatRoom.latestMessage.receiver.messageStatus = "read";
          return updatedChatRoom;
        }
        return chatRoom;
      });
    },
    addToChatRoomsWithUnreadMessages(state, action) {
      const alreadyExists = state.chatRoomsWithUnreadMessages.find((field) => {
        return field === action.payload;
      });
      if (!alreadyExists) {
        state.chatRoomsWithUnreadMessages.push(action.payload);
        state.newUnreadMessages++;
      }
    },
    removeFromChatRoomsWithUnreadMessages(state, action) {
      const alreadyExists = state.chatRoomsWithUnreadMessages.find((field) => {
        return field === action.payload;
      });
      if (alreadyExists) {
        state.chatRoomsWithUnreadMessages =
          state.chatRoomsWithUnreadMessages.filter(
            (field) => field !== action.payload
          );
        if (state.newUnreadMessages >= 0) {
          state.newUnreadMessages--;
        }
      }
    },
    addOlderPrivateMessages(state, action) {
      state.privateMessages = [...action.payload, ...state.privateMessages];
    },
    setPaginationDetails(state, action) {
      const { roomId, hasMoreMessages, currentPage } = action.payload;
      state.pagination[roomId] = { hasMoreMessages, currentPage };
    },
  },
});
export const {
  setSelectedChat,
  addPrivateMessage,
  setPrivateMessages,
  setMyPrivateChatRooms,
  addToMyPrivateChatRooms,
  setLatestMessageAsRead,
  addToChatRoomsWithUnreadMessages,
  removeFromChatRoomsWithUnreadMessages,
  removeFromMyPrivateChatRooms,
  addOlderPrivateMessages,
  setPaginationDetails,
} = echoLinkSlice.actions;
export default echoLinkSlice.reducer;
