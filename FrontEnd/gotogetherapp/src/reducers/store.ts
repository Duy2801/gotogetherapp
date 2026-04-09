import { configureStore } from '@reduxjs/toolkit';
import { loginReducer } from './index';
import notificationReducer from './notificationSlice';
import localeReducer from './localeReducer';

const store = configureStore({
  reducer: {
    login: loginReducer,
    notification: notificationReducer,
    locale: localeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
