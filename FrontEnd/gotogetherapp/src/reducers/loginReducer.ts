import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { setItem } from '../utils/storage';
import { KEY_STORAGE } from '../constants/KeyStorage';

interface User {
  id: string;
  email: string;
  fullName: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: number;
}

type LoginState = {
  user: User | null;
  accessToken: string;
  startDate: string | null;
};

const initialState: LoginState = {
  user: null,
  accessToken: '',
  startDate: null,
};

export const LoginReducer = createSlice({
  name: 'login',
  initialState,
  reducers: {
    login: (state, action) => {
      setItem(KEY_STORAGE.token, action.payload.accessToken);
      setItem(KEY_STORAGE.user, action.payload.user);
      if (action.payload.startDate) {
        setItem(KEY_STORAGE.startDate, action.payload.startDate);
      }
      return {
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        startDate: action.payload.startDate ? action.payload.startDate : null,
      };
    },
    logout: () => {
      setItem(KEY_STORAGE.token, '');
      setItem(KEY_STORAGE.user, '');
      setItem(KEY_STORAGE.startDate, '');
      return initialState;
    },
    updateUser: (state, action) => {
      setItem(KEY_STORAGE.user, action.payload);
      return {
        ...state,
        user: action.payload,
      };
    },
  },
});

export const { login, logout, updateUser } = LoginReducer.actions;
export default LoginReducer.reducer;
