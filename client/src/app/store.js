import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import echoShoutReducer from "./slices/echoShoutSlice";
import echoWhisperReducer from "./slices/echoWhisperSlice"

const store = configureStore({
  reducer: {
    auth: authReducer,
    echoShout: echoShoutReducer,
    echoWhisper: echoWhisperReducer,
  },
});

export default store;
