import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  theme: localStorage.getItem("theme") || "dracula",
  isLoggedIn: false,
  user: null,
  loading: false,
  isMobile: window.innerWidth < 640,
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
  },
});

export const { setIsLoggedIn, setLoading, setUser, setTheme, setIsMobile } =
  authSlice.actions;

export default authSlice.reducer;
