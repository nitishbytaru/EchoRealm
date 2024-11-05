import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import echoShoutReducer from "./slices/echoShoutSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    echoShout: echoShoutReducer,
  },
});

export default store;
