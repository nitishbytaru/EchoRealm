import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  privateMessages: [],
  selectedUser: null,
  myPrivateChatRooms: [],
  newUnreadMessages: 0,
  chatRoomsWithUnreadMessages: [],
};

const echoLinkSlice = createSlice({
  name: "echoLink",
  initialState,
  reducers: {
    addPrivateMessage(state, action) {
      if (!state.privateMessages) {
        state.privateMessages = [];
      }
      state.privateMessages.push(action.payload);
    },
    setPrivateMessages(state, action) {
      state.privateMessages = action.payload;
    },
    setSelectedUser(state, action) {
      state.selectedUser = action.payload;
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
    },
    setLatestMessageAsRead(state, action) {
      const chatId = action.payload?._id;

      state.myPrivateChatRooms = state.myPrivateChatRooms.map((chatRoom) => {
        if (chatRoom._id === chatId) {
          // Update the messageStatus to "read" in the latestMessage field
          return {
            ...chatRoom,
            latestMessage: {
              ...chatRoom.latestMessage,
              messageStatus: "read",
            },
          };
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
        state.newUnreadMessages--;
      }
    },
  },
});
export const {
  addPrivateMessage,
  setPrivateMessages,
  setSelectedUser,
  setMyPrivateChatRooms,
  addToMyPrivateChatRooms,
  setLatestMessageAsRead,
  addToChatRoomsWithUnreadMessages,
  removeFromChatRoomsWithUnreadMessages,
} = echoLinkSlice.actions;
export default echoLinkSlice.reducer;
