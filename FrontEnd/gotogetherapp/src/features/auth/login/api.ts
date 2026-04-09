import { api } from '../../../api';

export type LoginBody = {
  email: string;
  password: string;
};

export type RegisterBody = {
  email: string;
  password: string;
};

export const apiLogin = async (body: LoginBody) => {
  const url = '/auth/login';
  return api.post(url, body);
};

export const apiRegister = async (body: RegisterBody) => {
  const url = '/auth/register';
  return api.post(url, body);
};
