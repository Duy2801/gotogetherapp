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
  refreshToken: string;
  startDate: string | null;
};

const initialState: LoginState = {
  user: null,
  accessToken: '',
  refreshToken: '',
  startDate: null,
};

const addAvatarCacheBuster = (avatar?: string) => {
  if (!avatar) return avatar;
  try {
    const base = avatar.split('?')[0];
    return `${base}?t=${Date.now()}`;
  } catch {
    return avatar;
  }
};

export const LoginReducer = createSlice({
  name: 'login',
  initialState,
  reducers: {
    login: (state, action) => {
      const user = action.payload.user
        ? { ...action.payload.user, avatar: addAvatarCacheBuster(action.payload.user.avatar) }
        : action.payload.user;

      setItem(KEY_STORAGE.token, action.payload.accessToken);
      setItem(KEY_STORAGE.refreshToken, action.payload.refreshToken);
      setItem(KEY_STORAGE.user, user);
      if (action.payload.startDate) {
        setItem(KEY_STORAGE.startDate, action.payload.startDate);
      }
      return {
        user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        startDate: action.payload.startDate ? action.payload.startDate : null,
      };
    },
    logout: () => {
      setItem(KEY_STORAGE.token, '');
      setItem(KEY_STORAGE.refreshToken, '');
      setItem(KEY_STORAGE.user, '');
      setItem(KEY_STORAGE.startDate, '');
      return initialState;
    },
    updateUser: (state, action) => {
      const user = action.payload
        ? { ...action.payload, avatar: addAvatarCacheBuster(action.payload.avatar) }
        : action.payload;
      setItem(KEY_STORAGE.user, user);
      return {
        ...state,
        user,
      };
    },
  },
});

export const { login, logout, updateUser } = LoginReducer.actions;
export default LoginReducer.reducer;
