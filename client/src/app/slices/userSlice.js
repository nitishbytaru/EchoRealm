import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  blockedUsers: [], // users blocked by current user
  selectedViewProfileId: null, // selected user to view his profile
  resultOfSearchedUsers: [], // result of users after searched by his username
  myFriendRequests: [], // list of friend requests of the current user
  myFriendsList: [], // list of friends of the current users
  badgeOfPendingRequests: 0, //number of pending request
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
    removeFromBlockedUsers(state, action) {
      state.blockedUsers = state.blockedUsers.filter(
        (user) => user._id !== action.payload
      );
    },
    setResultOfSearchedUsers(state, action) {
      state.resultOfSearchedUsers = action.payload;
    },
    updateResultOfSearchedUsers(state, action) {
      state.resultOfSearchedUsers = state.resultOfSearchedUsers.map((user) => {
        if (user.userFriendData._id === action.payload._id) {
          user.userFriendData = action.payload;
        }
        return user; // Return the user as-is if it doesn't match the condition
      });
    },
    setMyFriendRequests(state, action) {
      state.myFriendRequests = action.payload;
    },
    removeFromMyFriendRequests(state, action) {
      state.myFriendRequests = state.myFriendRequests.filter(
        (user) => user._id !== action.payload
      );
    },
    setToMyFriendsList(state, action) {
      state.myFriendsList = action.payload;
    },
    addToMyFriendsList(state, action) {
      if (!state.myFriendsList.includes(action.payload)) {
        state.myFriendsList.push(action.payload);
      }
    },
    removeFromMyFriendsList(state, action) {
      state.myFriendsList = state.myFriendsList.filter(
        (friend) => friend._id !== action.payload
      );
    },
    setBadgeOfPendingRequests(state, action) {
      state.badgeOfPendingRequests = action.payload;
    },
  },
});

export const {
  setBlockedUsers,
  setSelectedViewProfileId,
  removeFromBlockedUsers,
  setResultOfSearchedUsers,
  updateResultOfSearchedUsers,
  setMyFriendRequests,
  removeFromMyFriendRequests,
  addToMyFriendsList,
  setToMyFriendsList,
  removeFromMyFriendsList,
  setBadgeOfPendingRequests,
} = userSlice.actions;

export default userSlice.reducer;
