import React from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import {ICONGOOGLE} from '../assets';

type Props = {
  onPress?: () => void;
  style?: ViewStyle;
  loading?: boolean;
  disabled?: boolean;
};

export default function GoogleSignInButton({
  onPress,
  style,
  loading,
  disabled,
}: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[styles.button, (loading || disabled) && styles.buttonDisabled, style]}
      onPress={onPress}
      disabled={loading || disabled}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="small" color="#222" />
        ) : (
          <>
            <Image source={ICONGOOGLE.GOOGLE} style={styles.googleImage} />
            <Text style={styles.text}>Đăng nhập bằng Google</Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d0d7de',
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
    alignSelf: 'center',
    minWidth: 220,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 1},
    elevation: 1,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  googleImage: {
    width: 18,
    height: 18,
    marginRight: 10,
    resizeMode: 'contain',
  },
  text: {
    color: '#222',
    fontSize: 14,
    fontWeight: '500',
  },
});
