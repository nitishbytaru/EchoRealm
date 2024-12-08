import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/auth.slice.js";
import userReducer from "../features/profile/slices/user.slice.js";
import echoShoutReducer from "../features/echoShout/slices/echo_shout.slice.js";
import echoMumbleReducer from "../features/echoMumble/slices/echo_mumble.slice.js";
import echoLinkReducer from "../features/echoLink/slices/echo_link.slice.js";

const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    echoShout: echoShoutReducer,
    echoMumble: echoMumbleReducer,
    echoLink: echoLinkReducer,
  },
});

export default store;
