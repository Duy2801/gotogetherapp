import React, { useMemo } from 'react';
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
import { useTranslation } from '../../hooks/useTranslation';
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
  const { t } = useTranslation();
  const translateY = useSharedValue(0);

  // Memoize tab labels to ensure they update when language changes
  const tabLabels = useMemo(
    () => ({
      home: t('tabs.home'),
      celebrate: t('tabs.celebrate'),
      budget: t('tabs.budget'),
      settings: t('tabs.settings'),
    }),
    [t],
  );

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
        options={{ tabBarLabel: tabLabels.home }}
        listeners={() => ({
          tabPress: () => {
            // Trigger re-render when tab is pressed
          },
        })}
      />
      <Tab.Screen
        name="CelebrateTab"
        component={CelebrateScreen}
        options={{ tabBarLabel: tabLabels.celebrate }}
      />
      <Tab.Screen
        name="BudgetTab"
        component={BudgetScreen}
        options={{ tabBarLabel: tabLabels.budget }}
      />
      <Tab.Screen
        name="SettingTab"
        component={SettingScreen}
        options={{ tabBarLabel: tabLabels.settings }}
      />
    </Tab.Navigator>
  );
};
export default TabNavigator;
