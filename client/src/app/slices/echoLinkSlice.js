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
      state.myPrivateFriends.push(action.payload);
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
