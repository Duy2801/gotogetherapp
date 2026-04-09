import { api } from '../../api';

export interface UpdateProfilePayload {
  fullName?: string;
  dateOfBirth?: string;
  gender?: number;
  avatar?: string;
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export const apiLogout = async () => {
  const url = '/auth/logout';
  return api.post(url);
};

export const updateProfile = async (payload: UpdateProfilePayload) => {
  return api.put('/user/me', payload);
};

export const changePassword = async (payload: ChangePasswordPayload) => {
  return api.post('/auth/change-password', payload);
};
