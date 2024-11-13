import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  whispers: [],
};

const whisperSlice = createSlice({
  name: "echoWhisper",
  initialState,
  reducers: {
    setWhispers(state, action) {
      state.whispers = action.payload;
    },
    updateWhispers(state, action) {
      state.whispers = state.whispers.map((whisper) =>
        whisper._id === action.payload._id ? action.payload : whisper
      );
    },
    removeWhisper(state, action) {
      state.whispers = state.whispers.filter(
        (whisper) => whisper._id !== action.payload
      );
    }
  },
});

export const {
  setWhispers,
  removeWhisper,
  updateWhispers,
  
} = whisperSlice.actions;
export default whisperSlice.reducer;
