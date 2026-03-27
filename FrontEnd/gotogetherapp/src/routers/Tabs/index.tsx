import {
  createBottomTabNavigator,
  BottomTabBar,
} from '@react-navigation/bottom-tabs';
import { Image, View } from 'react-native';
import { SCREEN_NAME } from '../../constants/screenName';
import HomeStack from './HomeStack';
import CelebrateStack from './CelebrateStack';
import BudgetScreen from '../../features/budget/BudgetScreen';
import SettingStack from './SettingStack';
import CusTomTabar from './CusTomTabar';
import SettingScreen from '../../features/setting/SettingScreen';
import CelebrateScreen from '../../features/celebrate/CelebrateScreen';
import HomeScreen from '../../features/home/HomeScreen';
import { ICONTAB } from '../../assets';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

const Tab = createBottomTabNavigator();
const ICON_MAP = {
  HomeTab: ICONTAB.HOME_ACTIVE,
  CelebrateTab: ICONTAB.CELEBRATE,
  BudgetTab: ICONTAB.SPENDING,
  SettingTab: ICONTAB.SETTING,
};
const TabNavigator = () => {
  const translateY = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#13ec5b',
        tabBarInactiveTintColor: '#888',

        tabBarStyle: {
          height: 60,
          backgroundColor: '#fff',
          borderTopWidth: 0.5,
          borderTopColor: '#ddd',
        },

        tabBarIcon: ({ focused }) => {
          const icon = ICON_MAP[route.name as keyof typeof ICON_MAP];

          return (
            <Image
              source={icon}
              style={{
                width: 24,
                height: 24,
                tintColor: focused ? '#13ec5b' : '#888',
              }}
              resizeMode="contain"
            />
          );
        },
      })}
      tabBar={props => (
        <Animated.View style={[animatedStyle]}>
          <BottomTabBar {...props} />
        </Animated.View>
      )}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="CelebrateTab"
        component={CelebrateScreen}
        options={{ tabBarLabel: 'Kỷ niệm' }}
      />
      <Tab.Screen
        name="BudgetTab"
        component={BudgetScreen}
        options={{ tabBarLabel: 'Ngân sách' }}
      />
      <Tab.Screen
        name="SettingTab"
        component={SettingScreen}
        options={{ tabBarLabel: 'Cài đặt' }}
      />
    </Tab.Navigator>
  );
};
export default TabNavigator;
