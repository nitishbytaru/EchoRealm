import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  privateMessages: [],
  selectedUser: null,
};

const echoLinkSlice = createSlice({
  name: "echoLink",
  initialState,
  reducers: {
    addEchoLinkMessage(state, action) {
      state.privateMessages.push(action.payload);
    },
    setEchoLinkMessages(state, action) {
      state.privateMessages = action.payload;
    },
    setSelectedUser(state, action) {
      state.selectedUser = action.payload;
    },
  },
});
export const { addEchoLinkMessage, setEchoLinkMessages, setSelectedUser } =
  echoLinkSlice.actions;
export default echoLinkSlice.reducer;
