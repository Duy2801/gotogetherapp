import React, { useCallback, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useDispatch } from 'react-redux';
import Toast from 'react-native-toast-message';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import {
  addNotification,
  removeNotification,
} from '../reducers/notificationSlice';
import { getToastConfig } from '../config';
import { useSocket } from '../services/useSocket';

/**
 * Global notification toast component
 * Listens to Socket.IO events and displays notifications
 */
const NotificationToast = () => {
  const dispatch = useDispatch();
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    /**
     * Handle incoming notification from socket
     */
    const handleNotification = (data: any) => {
      const notification = {
        id: `${Date.now()}-${Math.random()}`,
        type: data.type,
        title: data.title,
        message: data.message,
        data,
        timestamp: new Date().toISOString(),
        isRead: false,
      };

      // Add to Redux store
      dispatch(addNotification(notification));

      // Show toast
      showNotificationToast(notification);
    };

    // Subscribe to all notification events
    const events = [
      'trip:payment-marked',
      'trip:payment-confirmed',
      'trip:user-invited',
      'trip:member-joined',
      'trip:invite-rejected',
      'trip:expense-created',
      'trip:reminder',
    ];

    events.forEach(event => {
      socket.on(event, handleNotification);
    });

    return () => {
      // Cleanup
      events.forEach(event => {
        socket.off(event, handleNotification);
      });
    };
  }, [socket, dispatch]);

  /**
   * Show toast based on notification type using config
   */
  const showNotificationToast = useCallback(
    (notification: any) => {
      const { type, title, message, id } = notification;
      const config = getToastConfig(type);

      // Show Toast
      Toast.show({
        type: 'custom',
        position: 'top',
        visibilityTime: config.duration,
        text1: title,
        text2: message,
        topOffset: 40,
        props: {
          backgroundColor: config.backgroundColor,
          icon: config.icon,
          notificationId: id,
          onClose: () => {
            dispatch(removeNotification(id));
          },
        },
      });

      // Auto-dismiss from Redux after display duration
      setTimeout(() => {
        dispatch(removeNotification(id));
      }, config.duration + 500);
    },
    [dispatch],
  );

  return null;
};

/**
 * Custom Toast component for notifications
 */
export const CustomNotificationToast = ({ props }: any) => {
  const { backgroundColor, icon, text1, text2, notificationId, onClose } =
    props;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.content}>
        <FontAwesome6
          name={icon}
          size={18}
          color="#FFFFFF"
          iconStyle="solid"
          style={styles.icon}
        />
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {text1}
          </Text>
          <Text style={styles.message} numberOfLines={2}>
            {text2}
          </Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <FontAwesome6
            name="xmark"
            size={14}
            color="#FFFFFF"
            iconStyle="solid"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  icon: {
    flexShrink: 0,
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  message: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  closeButton: {
    padding: 4,
    flexShrink: 0,
  },
});

export default NotificationToast;
