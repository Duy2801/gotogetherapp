import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SCREEN_NAME } from '../../../constants/screenName';
import SpendingScreen from '../../../features/spending/SpedingScreen';
import PaymentDetailScreen from '../../../features/spending/components/PaymentDetailScreen';
import SpendingDetail from '../../../features/spending/components/SpendingDetail';

const Stack = createNativeStackNavigator();

const SpendingStack = () => {
  return (
    <Stack.Navigator
      initialRouteName={SCREEN_NAME.SPENDING}
      screenOptions={{
        headerStyle: {},
      }}
    >
      <Stack.Screen
        name={SCREEN_NAME.SPENDING}
        component={SpendingScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name={SCREEN_NAME.PAYMENT_DETAIL}
        component={PaymentDetailScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name={SCREEN_NAME.SPENDING_DETAIL}
        component={SpendingDetail}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};
export default SpendingStack;
