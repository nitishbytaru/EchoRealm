import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  privateMessages: [],
  selectedUser: null,
  myPrivateFriends: [],
};

const echoLinkSlice = createSlice({
  name: "echoLink",
  initialState,
  reducers: {
    addEchoLinkMessage(state, action) {
      if (!state.privateMessages) {
        state.privateMessages = [];
      }
      state.privateMessages.push(action.payload);
    },
    setEchoLinkMessages(state, action) {
      state.privateMessages = action.payload;
    },
    setSelectedUser(state, action) {
      state.selectedUser = action.payload;
    },
    setMyPrivateFriends(state, action) {
      state.myPrivateFriends = action.payload;
    },
    addMyPrivateFriends(state, action) {
      const existingFriend = state.myPrivateFriends.find(
        (friend) => friend._id === action.payload._id
      );
      if (existingFriend) {
        existingFriend.latestMessage = action.payload.latestMessage;
      } else {
        state.myPrivateFriends.push(action.payload);
      }
    },
  },
});
export const {
  addEchoLinkMessage,
  setEchoLinkMessages,
  setSelectedUser,
  setMyPrivateFriends,
  addMyPrivateFriends,
} = echoLinkSlice.actions;
export default echoLinkSlice.reducer;
