import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  Easing,
} from 'react-native';
import { useDispatch } from 'react-redux';
import Toast from 'react-native-toast-message';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import {
  addNotification,
  removeNotification,
  markAsRead,
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

  // Modal state for sliding detail
  const [modalVisible, setModalVisible] = useState(false);
  const [activeNotification, setActiveNotification] = useState<any>(null);
  const slideAnim = useRef(new Animated.Value(-320)).current;

  useEffect(() => {
    if (!socket) return;

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

    const events = [
      'trip:payment-marked',
      'trip:payment-confirmed',
      'trip:user-invited',
      'trip:member-joined',
      'trip:invite-rejected',
      'trip:expense-created',
      'trip:reminder',
    ];

    events.forEach(event => socket.on(event, handleNotification));

    return () => events.forEach(event => socket.off(event, handleNotification));
  }, [socket, dispatch]);

  const openDetail = (notification: any) => {
    Toast.hide();
    dispatch(markAsRead(notification.id));
    setActiveNotification(notification);
    setModalVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start();
  };

  const closeDetail = () => {
    Animated.timing(slideAnim, {
      toValue: -320,
      duration: 220,
      useNativeDriver: true,
      easing: Easing.in(Easing.cubic),
    }).start(() => {
      setModalVisible(false);
      setActiveNotification(null);
    });
  };

  const showNotificationToast = useCallback(
    (notification: any) => {
      const { type, title, message, id } = notification;
      const config = getToastConfig(type);

      Toast.show({
        type: 'notification',
        position: 'top',
        visibilityTime: config.duration,
        text1: title,
        text2: message,
        topOffset: 40,
        props: {
          backgroundColor: config.backgroundColor,
          icon: config.icon,
          toastAssetKey: config.toastAssetKey,
          notificationId: id,
          onClose: () => dispatch(removeNotification(id)),
          onPress: () => openDetail(notification),
        },
      });

      // Auto-dismiss from Redux after display duration
      setTimeout(() => {
        dispatch(removeNotification(id));
      }, config.duration + 500);
    },
    [dispatch],
  );

  return (
    <>
      <Modal visible={modalVisible} transparent animationType="none">
        <Animated.View
          style={[
            styles.detailModal,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.detailHeader}>
            <Text style={styles.detailTitle}>{activeNotification?.title}</Text>
            <TouchableOpacity onPress={closeDetail}>
              <FontAwesome6 name="xmark" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.detailBody}>
            <Text style={styles.detailMessage}>{activeNotification?.message}</Text>
          </View>
        </Animated.View>
      </Modal>
    </>
  );
};

/**
 * Custom Toast component for notifications
 */
export const CustomNotificationToast = ({ props }: any) => {
  const { backgroundColor, icon, text1, text2, notificationId, onClose, onPress } = props;

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={() => onPress && onPress()} style={[styles.container, { backgroundColor }]}> 
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
          <FontAwesome6 name="xmark" size={14} color="#FFFFFF" iconStyle="solid" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
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
  icon: { flexShrink: 0 },
  textContainer: { flex: 1, gap: 2 },
  title: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  message: { fontSize: 12, color: 'rgba(255, 255, 255, 0.9)' },
  closeButton: { padding: 4, flexShrink: 0 },

  // detail modal
  detailModal: {
    backgroundColor: '#0F172A',
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  detailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailTitle: { color: '#fff', fontWeight: '700', fontSize: 16 },
  detailBody: { marginTop: 12 },
  detailMessage: { color: 'rgba(255,255,255,0.95)' },
});

export default NotificationToast;
