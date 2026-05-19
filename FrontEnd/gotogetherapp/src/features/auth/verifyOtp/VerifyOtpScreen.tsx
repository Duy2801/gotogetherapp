import { useNavigation, useRoute } from '@react-navigation/native';
import { useState } from 'react';
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
import { SCREEN_NAME } from '../../../constants/screenName';
import { useDispatch } from 'react-redux';
import { login } from '../../../reducers/loginReducer';
import {
  apiResendRegisterOtp,
  apiVerifyRegisterOtp,
} from '../login/api';

const VerifyOtpScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const [email, setEmail] = useState(route.params?.email || '');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    if (!email.trim()) {
      Toast.show({ type: 'error', text1: t('auth.emailRequired') });
      return;
    }

    try {
      await apiResendRegisterOtp({ email });
      Toast.show({ type: 'success', text1: t('auth.resendOtpSuccess') });
    } catch (error) {
      const err = error as ApiError;
      Toast.show({ type: 'error', text1: err.message || t('auth.resendOtpFailed') });
    }
  };

  const handleVerify = async () => {
    if (!email.trim()) {
      Toast.show({ type: 'error', text1: t('auth.emailRequired') });
      return;
    }
    if (otp.trim().length !== 6) {
      Toast.show({ type: 'error', text1: t('auth.otpRequired') });
      return;
    }

    try {
      setLoading(true);
      const response = (await apiVerifyRegisterOtp({ email, otp })) as any;
      dispatch(
        login({
          user: response.user,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          startDate: response.startDate,
        }),
      );

      Toast.show({ type: 'success', text1: response.message || t('auth.verifySuccess') });

      const requiredFields = ['fullName', 'dateOfBirth', 'gender'];
      const isInfoComplete = requiredFields.every(field => {
        const value = response.user?.[field];
        if (value === null || value === undefined) {
          return false;
        }
        if (typeof value === 'string' && value.trim() === '') {
          return false;
        }
        return true;
      });

      if (isInfoComplete) {
        navigation.navigate(SCREEN_NAME.TABS as never);
      } else {
        navigation.replace(SCREEN_NAME.UPDATE_INFO as never, {
          fromAuthFlow: true,
        } as never);
      }
    } catch (error) {
      const err = error as ApiError;
      Toast.show({ type: 'error', text1: err.message || t('auth.verifyFailed') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Body hideHeader>
      <View style={styles.container}>
        <Text style={styles.title}>{t('auth.verifyOtp')}</Text>
        <Text style={styles.subtitle}>{t('auth.registerOtpSent')}</Text>

        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder={t('auth.email')}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          value={otp}
          onChangeText={setOtp}
          placeholder={t('auth.otp')}
          keyboardType="number-pad"
          maxLength={6}
        />

        <Button title={loading ? t('common.loading') : t('auth.verifyOtp')} onPress={handleVerify} />

        <TouchableOpacity style={styles.resendButton} onPress={handleResend}>
          <Text style={styles.resendText}>{t('auth.resendOtp')}</Text>
        </TouchableOpacity>

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
  subtitle: {
    marginTop: 8,
    color: '#666',
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
    marginTop: 20,
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

export default VerifyOtpScreen;