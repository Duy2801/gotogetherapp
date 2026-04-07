import {
  useNavigationContainerRef,
  NavigationContainer,
} from '@react-navigation/native';
import { SCREEN_NAME } from '../constants/screenName';
import OnboardingScreen from '../features/onboarding/OnboardingScreen';
import HomeScreen from '../features/home/HomeScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../features/auth/login/LoginScreen';
import RegisterScreen from '../features/auth/register/RegisterScreen';
import UpdateInfoScreen from '../features/profile/UpdateInfoScreen';
import TabNavigator from './Tabs';
import SpendingScreen from '../features/spending/SpedingScreen';
import PaymentDetailScreen from '../features/spending/components/PaymentDetailScreen';
import SettingScreen from '../features/setting/SettingScreen';
import CelebrateScreen from '../features/celebrate/CelebrateScreen';
import { TripDetailScreen, AddExpenseScreen } from '../features/tripdetail';
import AddTripScreen from '../features/home/components/AddTripScreen';
import SpendingDetail from '../features/spending/components/SpendingDetail';
import SpendingStatisticsScreen from '../features/statistic/SpendingStatisticsScreen';
const Stack = createNativeStackNavigator();

function ApplicationNavigator() {
  const ref = useNavigationContainerRef();

  const router = [
    { name: SCREEN_NAME.ONBOARDING, component: OnboardingScreen },
    { name: SCREEN_NAME.HOME, component: HomeScreen },
    { name: SCREEN_NAME.LOGIN, component: LoginScreen },
    { name: SCREEN_NAME.REGISTER, component: RegisterScreen },
    { name: SCREEN_NAME.UPDATE_INFO, component: UpdateInfoScreen },
    { name: SCREEN_NAME.TABS, component: TabNavigator },
    { name: SCREEN_NAME.CELEBRATE, component: CelebrateScreen },
    { name: SCREEN_NAME.SETTING, component: SettingScreen },
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
    // THieu TOAST
  );
}

export default ApplicationNavigator;
