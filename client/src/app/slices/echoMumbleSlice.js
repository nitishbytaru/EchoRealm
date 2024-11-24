import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  Mumbles: [],
  selectedUserToMumbles: [],
  pinnedMumblesInMyProfile: [],
  numberOfPinnedMumbles: 0,
};

const MumbleSlice = createSlice({
  name: "echoMumble",
  initialState,
  reducers: {
    setMumbles(state, action) {
      state.Mumbles = action.payload;
    },
    updateMumbles(state, action) {
      state.Mumbles = state.Mumbles.map((Mumble) =>
        Mumble?._id === action.payload?._id ? action.payload : Mumble
      );
    },
    removeMumble(state, action) {
      state.Mumbles = state.Mumbles.filter(
        (Mumble) => Mumble._id !== action.payload
      );
    },
    setPinnedMumbles(state, action) {
      state.pinnedMumblesInMyProfile = action.payload;
    },
    removePinnedMumble(state, action) {
      state.pinnedMumblesInMyProfile = state.pinnedMumblesInMyProfile.filter(
        (Mumble) => Mumble._id !== action.payload
      );
    },
    increaseNumberOfPinnedMumbles(state) {
      if (
        state.numberOfPinnedMumbles <= 4 ||
        state.numberOfPinnedMumbles >= 1
      ) {
        state.numberOfPinnedMumbles += 1;
      }
    },
    decreaseNumberOfPinnedMumbles(state) {
      if (
        state.numberOfPinnedMumbles <= 4 ||
        state.numberOfPinnedMumbles >= 1
      ) {
        state.numberOfPinnedMumbles -= 1;
      }
    },
    setNumberOfPinnedMumbles(state, action) {
      state.numberOfPinnedMumbles = action.payload;
    },
    setSelectedUserToMumble(state, action) {
      state.selectedUserToMumbles = action.payload;
    },
    updateSelectedUserToMumbles(state, action) {
      state.selectedUserToMumbles.selectedUserProfileMumbles =
        state.selectedUserToMumbles?.selectedUserProfileMumbles?.map((Mumble) =>
          Mumble?._id === action.payload?._id ? action.payload : Mumble
        );
    },
  },
});

export const {
  setMumbles,
  removeMumble,
  updateMumbles,
  removePinnedMumble,
  setPinnedMumbles,
  increaseNumberOfPinnedMumbles,
  setNumberOfPinnedMumbles,
  setSelectedUserToMumble,
  updateSelectedUserToMumbles,
} = MumbleSlice.actions;
export default MumbleSlice.reducer;
