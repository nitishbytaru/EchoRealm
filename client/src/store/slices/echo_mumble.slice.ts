import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface MumbleState {
  Mumbles: any[];
  selectedUserToMumbles: any;
  pinnedMumblesInMyProfile: any[];
  numberOfPinnedMumbles: number;
  unReadMumbles: number;
}

const initialState: MumbleState = {
  Mumbles: [],
  selectedUserToMumbles: [],
  pinnedMumblesInMyProfile: [],
  numberOfPinnedMumbles: 0,
  unReadMumbles: 0,
};

const MumbleSlice = createSlice({
  name: "echoMumble",
  initialState,
  reducers: {
    setMumbles(state, action: PayloadAction<any[]>) {
      state.Mumbles = action.payload;
    },
    updateMumbles(state, action: PayloadAction<any>) {
      state.Mumbles = state.Mumbles.map((Mumble) =>
        Mumble?._id === action.payload?._id ? action.payload : Mumble
      );
    },
    removeMumble(state, action: PayloadAction<string>) {
      state.Mumbles = state.Mumbles.filter(
        (Mumble) => Mumble._id !== action.payload
      );
    },
    addToMumbles(state, action: PayloadAction<any>) {
      state.Mumbles.push(action.payload);
    },
    setUnReadMumbles(state, action: PayloadAction<number>) {
      state.unReadMumbles = action.payload;
    },
    setPinnedMumbles(state, action: PayloadAction<any[]>) {
      state.pinnedMumblesInMyProfile = action.payload;
    },
    removePinnedMumble(state, action: PayloadAction<string>) {
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
    setNumberOfPinnedMumbles(state, action: PayloadAction<number>) {
      state.numberOfPinnedMumbles = action.payload;
    },
    setSelectedUserToMumble(state, action: PayloadAction<any>) {
      state.selectedUserToMumbles = action.payload;
    },
    updateSelectedUserToMumbles(state, action: PayloadAction<any>) {
      if (state.selectedUserToMumbles) {
        state.selectedUserToMumbles.selectedUserProfileMumbles =
          state.selectedUserToMumbles.selectedUserProfileMumbles?.map((Mumble: any) =>
            Mumble?._id === action.payload?._id ? action.payload : Mumble
          );
      }
    },
  },
});

export const {
  setMumbles,
  removeMumble,
  updateMumbles,
  addToMumbles,
  setUnReadMumbles,
  removePinnedMumble,
  setPinnedMumbles,
  increaseNumberOfPinnedMumbles,
  setNumberOfPinnedMumbles,
  setSelectedUserToMumble,
  updateSelectedUserToMumbles,
} = MumbleSlice.actions;

export default MumbleSlice.reducer;
