import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface EchoShoutState {
  pagination: {
    hasMoreMessages?: boolean;
    currentPage?: number;
  };
  messages: any[];
}

const initialState: EchoShoutState = {
  pagination: {},
  messages: [],
};

const echoShoutSlice = createSlice({
  name: "echoShout",
  initialState,
  reducers: {
    addEchoShoutMessage(state, action: PayloadAction<any>) {
      state.messages.push(action.payload);
    },
    setEchoShoutMessages(state, action: PayloadAction<any[]>) {
      state.messages = action.payload;
    },
    addOlderShouts(state, action: PayloadAction<any[]>) {
      state.messages = [...action.payload, ...state.messages];
    },
    setPaginationDetails(state, action: PayloadAction<{ hasMoreMessages: boolean; currentPage: number }>) {
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
