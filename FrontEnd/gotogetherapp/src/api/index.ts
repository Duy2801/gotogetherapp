import axios from 'axios';
import { base_url } from './constant';
import { clearAsync, getItem, setItem } from '../utils/storage';
import { KEY_STORAGE } from '../constants/KeyStorage';
import RNRestart from 'react-native-restart-newarch';

export const api = axios.create({
  baseURL: base_url,
  timeout: 6000,
});

const refreshClient = axios.create({
  baseURL: base_url,
  timeout: 6000,
});

// Normalize responses for refreshClient as well (same as `api`)
refreshClient.interceptors.response.use(
  response => {
    return response.data && response.data.data !== undefined
      ? response.data.data
      : response.data;
  },
  error => Promise.reject(error),
);

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
    // Normalize responses: some backends wrap payload as { status, data }
    // Return inner `data` when present, otherwise return response.data
    return response.data && response.data.data !== undefined
      ? response.data.data
      : response.data;
  },
  async error => {
    const originalRequest = error?.config;
    if (error.response) {
      if (
        error.response.status === 401 &&
        originalRequest &&
        !originalRequest._retry &&
        !String(originalRequest.url || '').includes('/auth/refresh-token')
      ) {
        originalRequest._retry = true;

        const refreshToken = await getItem(KEY_STORAGE.refreshToken);
        if (refreshToken) {
          try {
            const refreshResponse = await refreshClient.post(
              '/auth/refresh-token',
              {
                refreshToken,
              },
            );

            // refreshClient returns normalized data from interceptor
            const newAccessToken = (refreshResponse as any)?.accessToken;
            const newRefreshToken = (refreshResponse as any)?.refreshToken;

            if (newAccessToken && newRefreshToken) {
              await setItem(KEY_STORAGE.token, newAccessToken);
              await setItem(KEY_STORAGE.refreshToken, newRefreshToken);
              originalRequest.headers = {
                ...(originalRequest.headers || {}),
                authorization: `Bearer ${newAccessToken}`,
              };
              return api(originalRequest);
            }
          } catch (refreshError) {
            // fall through to session reset
          }
        }

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
