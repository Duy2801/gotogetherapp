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
import {showSuccessToast, showErrorToast} from '../../../utils/appToast';
import Body from '../../../components/Layout/Body';
import Button from '../../../components/Button/Button';
import { ApiError } from '../../../api';
import { useTranslation } from '../../../hooks/useTranslation';
import { apiForgotPassword } from '../login/api';
import { SCREEN_NAME } from '../../../constants/screenName';

const ForgotPasswordScreen = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOtp = async () => {
    if (!email.trim()) {
      Toast.show({ type: 'error', text1: t('auth.emailRequired') });
      return;
    }

    try {
      const response = (await apiForgotPassword({ email })) as any;
      setOtpSent(true);
      showSuccessToast(t('common.success'), response.message || t('auth.passwordResetOtpSent'));
      // navigate to separate OTP verification screen
      navigation.navigate(SCREEN_NAME.VERIFY_RESET_OTP as never, { email } as never);
    } catch (error) {
      const err = error as ApiError;
      showErrorToast(t('common.error'), err.message || t('auth.forgotPasswordFailed'));
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

        <Button title={t('auth.sendResetOtp')} onPress={handleSendOtp} />

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