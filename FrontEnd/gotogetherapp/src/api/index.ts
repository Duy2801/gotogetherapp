import axios from 'axios';
import { base_url } from './constant';
import { clearAsync, getItem } from '../utils/storage';
import { KEY_STORAGE } from '../constants/KeyStorage';
import RNRestart from 'react-native-restart-newarch';

export const api = axios.create({
  baseURL: base_url,
  timeout: 6000,
  headers: {
    'content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async function (config) {
    const token = await getItem(KEY_STORAGE.token);
    const locale = (await getItem(KEY_STORAGE.locale)) || 'vi';
    if (token) {
      config.headers['authorization'] = `Bearer ${token}`;
    }
    config.headers['x-locale'] = locale;
    config.params = {
      ...config.params,
    };
    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  response => {
    return response.data;
  },
  async error => {
    if (error.response) {
      if (error.response.status === 401) {
        await clearAsync();
        RNRestart.Restart();
      }
      return Promise.reject(error.response.data);
    }
    return Promise.reject(error);
  },
);
export type ApiError = {
  success: false;
  statusCode: number;
  error: string;
  message: string;
  errors: any;
  timestamp: string;
  path: string;
};
