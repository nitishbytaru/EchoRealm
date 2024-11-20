import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice.js";
import userReducer from "./slices/userSlice.js";
import echoShoutReducer from "./slices/echoShoutSlice.js";
import echoMumbleReducer from "./slices/echoMumbleSlice.js";
import echoLinkReducer from "./slices/echoLinkSlice.js";

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
