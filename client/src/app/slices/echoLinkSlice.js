import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  privateMessages: [],
  selectedUser: null,
  myPrivateChatRooms: [],
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
  },
});
export const {
  addPrivateMessage,
  setPrivateMessages,
  setSelectedUser,
  setMyPrivateChatRooms,
  addToMyPrivateChatRooms,
} = echoLinkSlice.actions;
export default echoLinkSlice.reducer;
