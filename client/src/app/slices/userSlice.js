import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  blockedUsers: [],
  currUserDetails: [],
  selectedViewProfileId: null,
  resultOfSearchedUsers: [],
  myFriendRequests: [],
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setBlockedUsers(state, action) {
      state.blockedUsers = action.payload;
    },
    setSelectedViewProfileId(state, action) {
      state.selectedViewProfileId = action.payload;
    },
    setCurrUserDetails(state, action) {
      state.currUserDetails = action.payload;
    },
    updateCurrUserDetails(state, action) {
      state.currUserDetails.selectedUserProfileMumbles =
        state.currUserDetails?.selectedUserProfileMumbles?.map((Mumble) =>
          Mumble?._id === action.payload?._id ? action.payload : Mumble
        );
    },
    removeFromBlockedUsers(state, action) {
      state.blockedUsers = state.blockedUsers.filter(
        (user) => user._id !== action.payload
      );
    },
    setResultOfSearchedUsers(state, action) {
      state.resultOfSearchedUsers = action.payload;
    },
    updateResultOfSearchedUsers(state, action) {
      state.resultOfSearchedUsers = state.resultOfSearchedUsers.map((user) =>
        user._id === action.payload._id ? action.payload : user
      );
    },
    setMyFriendRequests(state, action) {
      state.myFriendRequests = action.payload;
    },
    removeFromMyFriendRequests(state, action) {
      state.myFriendRequests = state.myFriendRequests.filter(
        (user) => user._id !== action.payload._id
      );
    },
  },
});

export const {
  setBlockedUsers,
  setSelectedViewProfileId,
  setCurrUserDetails,
  updateCurrUserDetails,
  removeFromBlockedUsers,
  setResultOfSearchedUsers,
  updateResultOfSearchedUsers,
  setMyFriendRequests,
  removeFromMyFriendRequests,
} = userSlice.actions;

export default userSlice.reducer;
