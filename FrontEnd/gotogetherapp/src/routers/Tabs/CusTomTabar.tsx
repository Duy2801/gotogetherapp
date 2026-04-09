import { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { ICONTAB } from '../../assets';
import { IsAndroid } from '../../constants';
import { useTranslation } from '../../hooks/useTranslation';

const TAB_WIDTH = IsAndroid ? 94 : 80;
const TAB_HEIGHT = 44;

const ICON_MAP = {
  HomeTab: {
    default: ICONTAB.HOME,
    active: ICONTAB.HOME_ACTIVE,
    name: 'tabs.home',
  },
  CelebrateTab: {
    default: ICONTAB.HOME,
    active: ICONTAB.HOME_ACTIVE,
    name: 'tabs.celebrate',
  },
  BudgetTab: {
    default: ICONTAB.HOME,
    active: ICONTAB.HOME_ACTIVE,
    name: 'tabs.budget',
  },
  SettingTab: {
    default: ICONTAB.HOME,
    active: ICONTAB.HOME_ACTIVE,
    name: 'tabs.settings',
  },
} as const;

type CustomTabBarProps = {
  state: any;
  navigation: any;
};

export default function CustomTabBar({ state, navigation }: CustomTabBarProps) {
  const { t } = useTranslation();
  const hideTabBar = state.routes[state.index]?.params?.hideTabBar;

  if (hideTabBar) return null;
  const translateX = useSharedValue(0);

  useEffect(() => {
    translateX.value = withTiming(state.index * TAB_WIDTH, {
      duration: 280,
    });
  }, [state.index]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <Animated.View style={[styles.animatedBg, animatedStyle]}>
          <LinearGradient
            colors={['#13ec5b', '#FFFF']}
            locations={[0, 0.8]} // 👈 xanh chỉ chiếm 30%
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[StyleSheet.absoluteFill, { borderRadius: 14 }]}
          />
        </Animated.View>

        {state.routes.map((route: any, index: number) => {
          const nameTab =
            ICON_MAP[route.name as keyof typeof ICON_MAP]?.name || '';
          const isFocused = state.index === index;

          const onPress = () => {
            if (!isFocused) navigation.navigate(route.name);
          };

          const iconSource =
            ICON_MAP[route.name as keyof typeof ICON_MAP][
              isFocused ? 'active' : 'default'
            ];

          return (
            <TouchableOpacity
              key={route.key}
              style={styles.tabItem}
              onPress={onPress}
              activeOpacity={0.8}
            >
              <Image source={iconSource} style={styles.icon} />
              {isFocused && <Text style={styles.activeText}>{t(nameTab)}</Text>}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    // position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
  },
  container: {
    height: 72,
    backgroundColor: '#fff',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },

  animatedBg: {
    position: 'absolute',
    left: 14,
    width: TAB_WIDTH,
    height: TAB_HEIGHT,
  },

  tabItem: {
    width: TAB_WIDTH,
    height: TAB_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },

  icon: {
    resizeMode: 'contain',
    width: IsAndroid ? 20 : 18,
    height: IsAndroid ? 20 : 18,
  },

  activeText: {
    color: '#fff',
    marginLeft: IsAndroid ? 8 : 4,
    fontWeight: '600',
    fontSize: IsAndroid ? 14 : 12,
  },
});
