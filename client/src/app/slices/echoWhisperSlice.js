import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  whispers: [],
  pinnedWhispers: [],
  currUserDetails: [],
  selectedViewProfileId: null,
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
        whisper?._id === action.payload?._id ? action.payload : whisper
      );
    },
    removeWhisper(state, action) {
      state.whispers = state.whispers.filter(
        (whisper) => whisper._id !== action.payload
      );
    },
    setPinnedWhispers(state, action) {
      state.pinnedWhispers = action.payload;
    },
    removePinnedWhisper(state, action) {
      state.pinnedWhispers = state.pinnedWhispers.filter(
        (whisper) => whisper._id !== action.payload
      );
    },
    setSelectedViewProfileId(state, action) {
      state.selectedViewProfileId = action.payload;
    },
    setCurrUserDetails(state, action) {
      state.currUserDetails = action.payload;
    },
    updateCurrUserDetails(state, action) {
      state.currUserDetails.selectedUserProfileWhispers =
        state.currUserDetails?.selectedUserProfileWhispers?.map((whisper) =>
          whisper?._id === action.payload?._id ? action.payload : whisper
        );
    },
  },
});

export const {
  setWhispers,
  removeWhisper,
  updateWhispers,
  removePinnedWhisper,
  setPinnedWhispers,
  setSelectedViewProfileId,
  setCurrUserDetails,
  updateCurrUserDetails,
} = whisperSlice.actions;
export default whisperSlice.reducer;
