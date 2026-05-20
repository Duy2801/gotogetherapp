import {
  useNavigationContainerRef,
  NavigationContainer,
} from '@react-navigation/native';
import type { ComponentType } from 'react';
import React from 'react';
import Toast from 'react-native-toast-message';
import { SCREEN_NAME } from '../constants/screenName';
import OnboardingScreen from '../features/onboarding/OnboardingScreen';
import HomeScreen from '../features/home/HomeScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../features/auth/login/LoginScreen';
import RegisterScreen from '../features/auth/register/RegisterScreen';
import VerifyOtpScreen from '../features/auth/verifyOtp/VerifyOtpScreen';
import ForgotPasswordScreen from '../features/auth/forgotPassword/ForgotPasswordScreen';
import VerifyResetOtpScreen from '../features/auth/forgotPassword/VerifyResetOtpScreen';
import ResetPasswordScreen from '../features/auth/forgotPassword/ResetPasswordScreen';
import { UpdateInfoScreen } from '../features/profile';
import TabNavigator from './Tabs';
import SpendingScreen from '../features/spending/SpedingScreen';
import PaymentDetailScreen from '../features/spending/components/PaymentDetailScreen';
import SettingScreen from '../features/setting/SettingScreen';
import CelebrateScreen from '../features/celebrate/CelebrateScreen';
import { TripDetailScreen, AddExpenseScreen } from '../features/tripdetail';
import AddTripScreen from '../features/home/components/AddTripScreen';
import SpendingDetail from '../features/spending/components/SpendingDetail';
import SpendingStatisticsScreen from '../features/statistic/SpendingStatisticsScreen';
import ChangePasswordScreen from '../features/setting/screens/ChangePasswordScreen';
import HistoryScreen from '../features/setting/screens/HistoryScreen';
import { CustomToastComponent } from '../config/Toast';
import NotificationToast from '../components/NotificationToast';
import store from '../reducers/store';
import { login } from '../reducers/loginReducer';
const Stack = createNativeStackNavigator();

type AppRouteItem = {
  name: string;
  component: ComponentType<any>;
  options?: Record<string, any>;
};

function ApplicationNavigator() {
  const ref = useNavigationContainerRef();

  const toastConfig = {
    notification: (toastProps: any) => <CustomToastComponent {...toastProps} />,
    success: (toastProps: any) => (
      <CustomToastComponent
        {...toastProps}
        props={{
          ...(toastProps?.props || {}),
          toastAssetKey: 'SUCCESS',
          backgroundColor: '#10B981',
        }}
      />
    ),
    error: (toastProps: any) => (
      <CustomToastComponent
        {...toastProps}
        props={{
          ...(toastProps?.props || {}),
          toastAssetKey: 'ERROR',
          backgroundColor: '#EF4444',
        }}
      />
    ),
    info: (toastProps: any) => (
      <CustomToastComponent
        {...toastProps}
        props={{
          ...(toastProps?.props || {}),
          toastAssetKey: 'NOTIFICATION',
          backgroundColor: '#3B82F6',
        }}
      />
    ),
    warning: (toastProps: any) => (
      <CustomToastComponent
        {...toastProps}
        props={{
          ...(toastProps?.props || {}),
          toastAssetKey: 'NOTIFICATION',
          backgroundColor: '#F59E0B',
        }}
      />
    ),
  };

  const router: AppRouteItem[] = [
    { name: SCREEN_NAME.ONBOARDING, component: OnboardingScreen },
    { name: SCREEN_NAME.HOME, component: HomeScreen },
    { name: SCREEN_NAME.LOGIN, component: LoginScreen },
    { name: SCREEN_NAME.REGISTER, component: RegisterScreen },
    { name: SCREEN_NAME.VERIFY_OTP, component: VerifyOtpScreen },
    { name: SCREEN_NAME.FORGOT_PASSWORD, component: ForgotPasswordScreen },
    { name: SCREEN_NAME.VERIFY_RESET_OTP, component: VerifyResetOtpScreen },
    { name: SCREEN_NAME.RESET_PASSWORD, component: ResetPasswordScreen },
    { name: SCREEN_NAME.UPDATE_INFO, component: UpdateInfoScreen },
    { name: SCREEN_NAME.TABS, component: TabNavigator },
    { name: SCREEN_NAME.CELEBRATE, component: CelebrateScreen },
    { name: SCREEN_NAME.SETTING, component: SettingScreen },
    { name: SCREEN_NAME.CHANGE_PASSWORD, component: ChangePasswordScreen },
    { name: SCREEN_NAME.HISTORY, component: HistoryScreen },
    { name: SCREEN_NAME.SPENDING, component: SpendingScreen },
    { name: SCREEN_NAME.PAYMENT_DETAIL, component: PaymentDetailScreen },
    {
      name: SCREEN_NAME.SPENDING_STATISTICS,
      component: SpendingStatisticsScreen,
    },
    { name: SCREEN_NAME.TRIP_DETAIL, component: TripDetailScreen },
    { name: SCREEN_NAME.SPENDING_DETAIL, component: SpendingDetail },
    { name: SCREEN_NAME.ADD_TRIP, component: AddTripScreen },
    {
      name: SCREEN_NAME.ADD_EXPENSE,
      component: AddExpenseScreen,
      options: {
        presentation: 'transparentModal',
        animation: 'fade',
        contentStyle: { backgroundColor: 'transparent' },
      },
    },
  ];

  return (
    <>
      <NavigationContainer ref={ref}>
        <Stack.Navigator>
          {router.map(item => (
            <Stack.Screen
              key={item.name}
              name={item.name}
              component={item.component}
              options={{ headerShown: false, ...(item as any).options }}
            />
          ))}
        </Stack.Navigator>
      </NavigationContainer>
      <Toast config={toastConfig as any} />
      {/* NotificationToast listens to socket and opens sliding modal on press */}
      <NotificationToast />
    </>
  );
}

export default ApplicationNavigator;
