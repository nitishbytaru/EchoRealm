import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice.js";
import echoShoutReducer from "./slices/echoShoutSlice.js";
import echoWhisperReducer from "./slices/echoWhisperSlice.js";
import echoLinkReducer from "./slices/echoLinkSlice.js";

const store = configureStore({
  reducer: {
    auth: authReducer,
    echoShout: echoShoutReducer,
    echoWhisper: echoWhisperReducer,
    echoLink: echoLinkReducer,
  },
});

export default store;
