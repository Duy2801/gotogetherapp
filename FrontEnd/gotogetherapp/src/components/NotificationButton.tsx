import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, View, Text, Animated } from 'react-native';
import { useSelector } from 'react-redux';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { RootState } from '../reducers/store';
import { NotificationCenter } from '../features/notification/NotificationCenter';
import { PRIMARY_COLOR } from '../constants/color';

/**
 * Notification Button Component
 * Displays bell icon with unread count badge
 * Click to open Notification Center modal
 *
 * Usage:
 * In header or navigation: <NotificationButton />
 */
export const NotificationButton: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const unreadCount = useSelector(
    (state: RootState) => state.notification?.unreadCount || 0,
  );

  const badgeScale = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (unreadCount > 0) {
      Animated.sequence([
        Animated.timing(badgeScale, {
          toValue: 1.2,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(badgeScale, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [unreadCount, badgeScale]);

  return (
    <>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setIsModalVisible(true)}
        activeOpacity={0.7}
      >
        <FontAwesome6
          name="bell"
          size={22}
          color={PRIMARY_COLOR}
          iconStyle="solid"
        />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <Animated.View
            style={[
              styles.badge,
              {
                transform: [{ scale: badgeScale }],
              },
            ]}
          >
            <Text style={styles.badgeText}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </Animated.View>
        )}
      </TouchableOpacity>

      {/* Notification Center Modal */}
      <NotificationCenter
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default NotificationButton;
