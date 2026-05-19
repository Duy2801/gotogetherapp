import {useNavigation, useRoute} from '@react-navigation/native';
import React, {useState} from 'react';
import {StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import Toast from 'react-native-toast-message';
import {showSuccessToast, showErrorToast} from '../../../utils/appToast';
import Body from '../../../components/Layout/Body';
import Button from '../../../components/Button/Button';
import {useTranslation} from '../../../hooks/useTranslation';
import {SCREEN_NAME} from '../../../constants/screenName';
import {apiResetPasswordOtp} from '../login/api';

const VerifyResetOtpScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const {t} = useTranslation();

  const [email] = useState(route.params?.email || '');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const handleVerify = () => {
    if (!email.trim()) {
      showErrorToast(t('common.error'), t('auth.emailRequired'));
      return;
    }
    if (otp.trim().length !== 6) {
      showErrorToast(t('common.error'), t('auth.otpRequired'));
      return;
    }

    // since backend's verify endpoint requires newPassword, we mark OTP as verified locally
    // then show the password inputs on the same screen and submit reset there.
    setVerified(true);
    showSuccessToast(t('common.success'), t('auth.verifySuccess'));
  };

  const handleReset = async () => {
    if (!verified) return;
    if (newPassword.length < 6) {
      Toast.show({type: 'error', text1: t('auth.passwordTooShort')});
      return;
    }
    if (newPassword !== confirmNewPassword) {
      Toast.show({type: 'error', text1: t('auth.passwordsNotMatch')});
      return;
    }

    try {
      setLoading(true);
      const response: any = await apiResetPasswordOtp({email, otp, newPassword});
      Toast.show({type: 'success', text1: response.message || t('auth.resetSuccess')});
      navigation.navigate(SCREEN_NAME.LOGIN as never);
    } catch (err: any) {
      Toast.show({type: 'error', text1: err.message || t('auth.resetFailed')});
    } finally {
      setLoading(false);
    }
  };

  return (
    <Body hideHeader>
      <View style={styles.container}>
        <Text style={styles.title}>{t('auth.verifyOtp')}</Text>
        <Text style={styles.subtitle}>{t('auth.registerOtpSent')}</Text>

        {!verified ? (
          <>
            <TextInput
              style={styles.input}
              value={email}
              editable={false}
            />

            <TextInput
              style={styles.input}
              value={otp}
              onChangeText={setOtp}
              placeholder={t('auth.otp')}
              keyboardType="number-pad"
              maxLength={6}
            />
          </>
        ) : (
          <View style={styles.emailPreviewWrap}>
            <Text style={styles.emailLabel}>{t('auth.resetFor')}</Text>
            <Text style={styles.emailText}>{email}</Text>
          </View>
        )}

        {!verified ? (
          <Button title={loading ? t('common.loading') : t('auth.verifyOtp')} onPress={handleVerify} />
        ) : (
          <>
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
            <Button title={loading ? t('common.loading') : t('auth.resetPassword')} onPress={handleReset} />
          </>
        )}

        <TouchableOpacity onPress={() => navigation.navigate(SCREEN_NAME.FORGOT_PASSWORD as never)}>
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
  title: {fontSize: 30, fontWeight: 'bold'},
  subtitle: {marginTop: 8, color: '#666'},
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
  backText: {marginTop: 18, textAlign: 'center', color: '#666'},
  emailPreviewWrap: {
    marginTop: 12,
    alignItems: 'center',
  },
  emailLabel: {
    color: '#888',
    fontSize: 13,
    marginBottom: 6,
  },
  emailText: {
    color: '#222',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default VerifyResetOtpScreen;
