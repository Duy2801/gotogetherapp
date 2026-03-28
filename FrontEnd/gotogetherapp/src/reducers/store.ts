import { configureStore } from "@reduxjs/toolkit";
import { loginReducer } from "./index";
import notificationReducer from "./notificationSlice";

const store = configureStore({
  reducer: {
    login: loginReducer,
    notification: notificationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
