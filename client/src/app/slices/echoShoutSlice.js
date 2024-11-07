import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  messages: [],
};

const messageSlice = createSlice({
  name: "echoShout",
  initialState,
  reducers: {
    addMessage(state, action) {
      state.messages.push(action.payload);
    },
    setMessages(state, action) {
      state.messages = action.payload;
    },
  },
});
addMessage: (state, action) => {
  state.messages.unshift(action.payload); // Add to beginning of array
}
export const { addMessage, setMessages } = messageSlice.actions;
export default messageSlice.reducer;
