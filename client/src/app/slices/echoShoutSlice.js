import { createSlice } from "@reduxjs/toolkit";

const initialState = {
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
  },
});

export const { addEchoShoutMessage, setEchoShoutMessages } =
  echoShoutSlice.actions;
export default echoShoutSlice.reducer;
