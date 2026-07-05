import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserState {
  blockedUsers: any[];
  viewingProfileUserDetails: any;
  resultOfSearchedUsers: any[];
  myFriendRequests: any[];
  myFriendsList: any[];
  badgeOfPendingRequests: number;
}

const initialState: UserState = {
  blockedUsers: [],
  viewingProfileUserDetails: null,
  resultOfSearchedUsers: [],
  myFriendRequests: [],
  myFriendsList: [],
  badgeOfPendingRequests: 0,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setBlockedUsers(state, action: PayloadAction<any[]>) {
      state.blockedUsers = action.payload;
    },
    removeFromBlockedUsers(state, action: PayloadAction<string>) {
      state.blockedUsers = state.blockedUsers.filter(
        (user) => user._id !== action.payload
      );
    },
    setResultOfSearchedUsers(state, action: PayloadAction<any[]>) {
      state.resultOfSearchedUsers = action.payload;
    },
    updateResultOfSearchedUsers(state, action: PayloadAction<any>) {
      state.resultOfSearchedUsers = state.resultOfSearchedUsers.map((user) => {
        if (user.userFriendData._id === action.payload._id) {
          user.userFriendData = action.payload;
        }
        return user;
      });
    },
    setMyFriendRequests(state, action: PayloadAction<any[]>) {
      state.myFriendRequests = action.payload;
    },
    removeFromMyFriendRequests(state, action: PayloadAction<string>) {
      state.myFriendRequests = state.myFriendRequests.filter(
        (user) => user._id !== action.payload
      );
    },
    setToMyFriendsList(state, action: PayloadAction<any[]>) {
      state.myFriendsList = action.payload;
    },
    addToMyFriendsList(state, action: PayloadAction<any>) {
      if (!state.myFriendsList.find(f => f._id === action.payload._id)) {
        state.myFriendsList.push(action.payload);
      }
    },
    removeFromMyFriendsList(state, action: PayloadAction<string>) {
      state.myFriendsList = state.myFriendsList.filter(
        (friend) => friend._id !== action.payload
      );
    },
    setBadgeOfPendingRequests(state, action: PayloadAction<number>) {
      state.badgeOfPendingRequests = action.payload;
    },
    updateViewingProfileUserDetails(state, action: PayloadAction<any>) {
      if (state.viewingProfileUserDetails) {
        state.viewingProfileUserDetails.selectedUserProfileMumbles =
          state.viewingProfileUserDetails.selectedUserProfileMumbles?.map(
            (mumble: any) =>
              mumble?._id === action.payload?._id ? action.payload : mumble
          );
      }
    },
    setViewingProfileUserDetails(state, action: PayloadAction<any>) {
      state.viewingProfileUserDetails = action.payload;
    },
  },
});

export const {
  setBlockedUsers,
  removeFromBlockedUsers,
  setResultOfSearchedUsers,
  updateResultOfSearchedUsers,
  setMyFriendRequests,
  removeFromMyFriendRequests,
  addToMyFriendsList,
  setToMyFriendsList,
  removeFromMyFriendsList,
  setBadgeOfPendingRequests,
  updateViewingProfileUserDetails,
  setViewingProfileUserDetails,
} = userSlice.actions;

export default userSlice.reducer;
