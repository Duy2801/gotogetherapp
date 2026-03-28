import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Platform } from 'react-native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { getToastConfig } from './toastConfig';

/**
 * Custom Toast Component for react-native-toast-message
 * Displays notifications with icon, title, message, and close button
 *
 * Usage in App.tsx:
 * <Toast config={{ notification: CustomToastComponent }} />
 */
export const CustomToastComponent = ({ props }: any) => {
  const { backgroundColor, icon, text1, text2, notificationId, onClose } = props;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.content}>
        {/* Icon */}
        <FontAwesome6
          name={icon || 'info-circle'}
          size={18}
          color="#FFFFFF"
          iconStyle="solid"
          style={styles.icon}
        />

        {/* Text Content */}
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {text1}
          </Text>
          <Text style={styles.message} numberOfLines={2}>
            {text2}
          </Text>
        </View>

        {/* Close Button */}
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
    ...Platform.select({
      ios: {
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
    }),
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
    lineHeight: 16,
  },
  closeButton: {
    padding: 4,
    flexShrink: 0,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    width: 28,
    height: 28,
  },
});

export default CustomToastComponent;
