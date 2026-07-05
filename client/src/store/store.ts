import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/auth.slice";
import userReducer from "./slices/user.slice";
import echoShoutReducer from "./slices/echo_shout.slice";
import echoMumbleReducer from "./slices/echo_mumble.slice";
import echoLinkReducer from "./slices/echo_link.slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    echoShout: echoShoutReducer,
    echoMumble: echoMumbleReducer,
    echoLink: echoLinkReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
