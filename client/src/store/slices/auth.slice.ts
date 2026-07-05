import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: {
    url?: string;
    public_id?: string;
  };
  isAcceptingMumbles?: boolean;
  isAnonymous?: boolean;
}

export interface AuthState {
  theme: string;
  isLoggedIn: boolean;
  user: User | null;
  isMobile: boolean;
  isChecked: boolean;
}

const initialState: AuthState = {
  theme: "business",
  isLoggedIn: false,
  user: null,
  isMobile: false,
  isChecked: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setIsLoggedIn(state, action: PayloadAction<boolean>) {
      state.isLoggedIn = action.payload;
    },
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
    },
    setTheme(state, action: PayloadAction<string>) {
      state.theme = action.payload;
    },
    setIsMobile(state, action: PayloadAction<boolean>) {
      state.isMobile = action.payload;
    },
    setIsChecked(state, action: PayloadAction<boolean>) {
      state.isChecked = action.payload;
    },
  },
});

export const { setIsLoggedIn, setUser, setTheme, setIsMobile, setIsChecked } = authSlice.actions;

export default authSlice.reducer;
