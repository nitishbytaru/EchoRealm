import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  pagination: {},
  messages: [],
};

const echoShoutSlice = createSlice({
  name: "echoShout",
  initialState,
  reducers: {
    addEchoShoutMessage(state, action) {
      state.messages.push(action.payload);
    },
    setEchoShoutMessages(state, action) {
      state.messages = action.payload;
    },
    addOlderShouts(state, action) {
      state.messages = [...action.payload, ...state.messages];
    },
    setPaginationDetails(state, action) {
      const { hasMoreMessages, currentPage } = action.payload;
      state.pagination = { hasMoreMessages, currentPage };
    },
  },
});

export const {
  addEchoShoutMessage,
  setEchoShoutMessages,
  addOlderShouts,
  setPaginationDetails,
} = echoShoutSlice.actions;
export default echoShoutSlice.reducer;
