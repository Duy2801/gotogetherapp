import { api } from '../../../api';

export type LoginBody = {
  email: string;
  password: string;
};

export type GoogleLoginBody = {
  idToken: string;
};

export type RegisterBody = {
  email: string;
  password: string;
  fullName?: string;
};

export type VerifyRegisterOtpBody = {
  email: string;
  otp: string;
};

export type ResendOtpBody = {
  email: string;
};

export type ForgotPasswordBody = {
  email: string;
};

export type ResetPasswordOtpBody = {
  email: string;
  otp: string;
  newPassword: string;
};

export const apiLogin = async (body: LoginBody) => {
  const url = '/auth/login';
  return api.post(url, body);
};

export const apiRegister = async (body: RegisterBody) => {
  const url = '/auth/register';
  return api.post(url, body);
};

export const apiVerifyRegisterOtp = async (body: VerifyRegisterOtpBody) => {
  return api.post('/auth/register/verify-otp', body);
};

export const apiResendRegisterOtp = async (body: ResendOtpBody) => {
  return api.post('/auth/register/resend-otp', body);
};

export const apiForgotPassword = async (body: ForgotPasswordBody) => {
  return api.post('/auth/forgot-password', body);
};

export const apiVerifyForgotOtp = async (body: { email: string; otp: string }) => {
  return api.post('/auth/forgot-password/verify-otp', body);
};

export const apiResetPasswordOtp = async (body: ResetPasswordOtpBody) => {
  return api.post('/auth/forgot-password/verify-otp', body);
};

export const apiGoogleLogin = async (body: GoogleLoginBody) => {
  return api.post('/auth/google/mobile', body);
};
