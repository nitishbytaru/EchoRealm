import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  theme: localStorage.getItem("theme") || "business",
  isLoggedIn: false,
  user: null,
  loading: false,
  blockedUsers: [],
  isMobile: window.innerWidth < 640,
  isChecked: localStorage.getItem("theme") === "business",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setIsLoggedIn: (state, action) => {
      state.isLoggedIn = action.payload;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    setIsMobile(state, action) {
      state.isMobile = action.payload;
    },
    setIsChecked(state, action) {
      state.isChecked = action.payload;
    },
    setBlockedUsers(state, action) {
      state.blockedUsers = action.payload;
    },
    removeFromBlockedUsers(state, action) {
      state.blockedUsers = state.blockedUsers.filter(
        (user) => user._id !== action.payload
      );
    },
  },
});

export const {
  setIsLoggedIn,
  setLoading,
  setUser,
  setTheme,
  setIsMobile,
  setIsChecked,
  setBlockedUsers,
  removeFromBlockedUsers,
} = authSlice.actions;

export default authSlice.reducer;
