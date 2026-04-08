import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Platform,
  Image,
} from 'react-native';
import Toast from 'react-native-toast-message';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { Toast as ToastAsset } from '../assets';

/**
 * Custom Toast Component for react-native-toast-message
 * Displays notifications with icon, title, message, and close button
 *
 * Usage in App.tsx:
 * <Toast config={{ notification: CustomToastComponent }} />
 */
const TOAST_FALLBACK = {
  SUCCESS: {
    backgroundColor: '#10B981',
    title: 'Thành công',
  },
  ERROR: {
    backgroundColor: '#EF4444',
    title: 'Lỗi',
  },
  NOTIFICATION: {
    backgroundColor: '#3B82F6',
    title: 'Thông báo',
  },
} as const;

const normalizeToastText = (value: unknown): string => {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (Array.isArray(value)) {
    return value
      .map(item => (typeof item === 'string' ? item.trim() : String(item)))
      .filter(Boolean)
      .join('\n');
  }

  if (value === null || value === undefined) {
    return '';
  }

  return String(value).trim();
};

export const CustomToastComponent = ({ text1, text2, props }: any) => {
  const toastAssetKey = (props?.toastAssetKey || 'NOTIFICATION') as
    | 'SUCCESS'
    | 'ERROR'
    | 'NOTIFICATION';

  const fallbackStyle =
    TOAST_FALLBACK[toastAssetKey] || TOAST_FALLBACK.NOTIFICATION;
  const backgroundColor =
    props?.backgroundColor || fallbackStyle.backgroundColor;
  const resolvedTitle =
    normalizeToastText(text1) ||
    normalizeToastText(props?.text1) ||
    normalizeToastText(props?.title);
  const title = resolvedTitle || fallbackStyle.title;
  const message =
    normalizeToastText(text2) ||
    normalizeToastText(props?.text2) ||
    normalizeToastText(props?.message) ||
    normalizeToastText(props?.data?.message);
  const onClose = props?.onClose || (() => Toast.hide());
  const imageSource =
    ToastAsset[toastAssetKey as keyof typeof ToastAsset] ||
    ToastAsset.NOTIFICATION;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.content}>
        <Image
          source={imageSource}
          style={styles.toastImage}
          resizeMode="contain"
        />

        {/* Text Content */}
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {!!message && (
            <Text style={styles.message} numberOfLines={3}>
              {message}
            </Text>
          )}
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
    width: '92%',
    alignSelf: 'center',
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
  },
  icon: {
    flexShrink: 0,
  },
  toastImage: {
    width: 24,
    height: 24,
    flexShrink: 0,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  message: {
    marginTop: 2,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 16,
  },
  closeButton: {
    marginLeft: 10,
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
