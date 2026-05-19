import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import Body from '../../../components/Layout/Body';
import Button from '../../../components/Button/Button';
import { ApiError } from '../../../api';
import { useTranslation } from '../../../hooks/useTranslation';
import { apiForgotPassword, apiResetPasswordOtp } from '../login/api';
import { SCREEN_NAME } from '../../../constants/screenName';

const ForgotPasswordScreen = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const handleSendOtp = async () => {
    if (!email.trim()) {
      Toast.show({ type: 'error', text1: t('auth.emailRequired') });
      return;
    }

    try {
      const response = (await apiForgotPassword({ email })) as any;
      setOtpSent(true);
      Toast.show({ type: 'success', text1: response.message || t('auth.passwordResetOtpSent') });
    } catch (error) {
      const err = error as ApiError;
      Toast.show({ type: 'error', text1: err.message || t('auth.forgotPasswordFailed') });
    }
  };

  const handleResetPassword = async () => {
    if (!otpSent) {
      return;
    }
    if (otp.trim().length !== 6) {
      Toast.show({ type: 'error', text1: t('auth.otpRequired') });
      return;
    }
    if (newPassword.length < 6) {
      Toast.show({ type: 'error', text1: t('auth.passwordTooShort') });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      Toast.show({ type: 'error', text1: t('auth.passwordsNotMatch') });
      return;
    }

    try {
      const response = (await apiResetPasswordOtp({
        email,
        otp,
        newPassword,
      })) as any;
      Toast.show({ type: 'success', text1: response.message || t('auth.resetSuccess') });
      navigation.navigate(SCREEN_NAME.LOGIN as never);
    } catch (error) {
      const err = error as ApiError;
      Toast.show({ type: 'error', text1: err.message || t('auth.resetFailed') });
    }
  };

  return (
    <Body hideHeader>
      <View style={styles.container}>
        <Text style={styles.title}>{t('auth.resetPassword')}</Text>

        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder={t('auth.email')}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!otpSent}
        />

        {otpSent ? (
          <>
            <TextInput
              style={styles.input}
              value={otp}
              onChangeText={setOtp}
              placeholder={t('auth.otp')}
              keyboardType="number-pad"
              maxLength={6}
            />
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder={t('auth.newPassword')}
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
              placeholder={t('auth.confirmNewPassword')}
              secureTextEntry
            />
            <Button title={t('auth.resetPassword')} onPress={handleResetPassword} />
            <TouchableOpacity onPress={handleSendOtp} style={styles.resendButton}>
              <Text style={styles.resendText}>{t('auth.resendOtp')}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Button title={t('auth.sendResetOtp')} onPress={handleSendOtp} />
        )}

        <TouchableOpacity onPress={() => navigation.navigate(SCREEN_NAME.LOGIN as never)}>
          <Text style={styles.backText}>{t('common.back')}</Text>
        </TouchableOpacity>
      </View>
    </Body>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 10,
    paddingHorizontal: 30,
    paddingTop: 60,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    height: 50,
    borderBottomWidth: 1,
    borderRadius: 10,
    borderColor: '#636363',
    marginTop: 24,
    paddingHorizontal: 10,
    opacity: 0.8,
  },
  resendButton: {
    marginTop: 16,
    alignSelf: 'center',
  },
  resendText: {
    color: '#2563EB',
    fontWeight: '600',
  },
  backText: {
    marginTop: 18,
    textAlign: 'center',
    color: '#666',
  },
});

export default ForgotPasswordScreen;