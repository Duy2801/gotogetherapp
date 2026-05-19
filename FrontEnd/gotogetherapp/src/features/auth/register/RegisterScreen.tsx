import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Body from '../../../components/Layout/Body';
import { LOGO } from '../../../assets';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { login } from '../../../reducers/loginReducer';
import { SECONDARY_COLOR } from '../../../constants/color';
import { useState } from 'react';
import Button from '../../../components/Button/Button';
import { useTranslation } from '../../../hooks/useTranslation';
import Toast from 'react-native-toast-message';
import {
  apiRegister,
  apiVerifyRegisterOtp,
  apiResendRegisterOtp,
} from '../login/api';
import { SCREEN_NAME } from '../../../constants/screenName';
import { ApiError } from '../../../api';

const RegisterScreen = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();

  const validate = () => {
    if (!email.trim()) {
      Toast.show({ type: 'error', text1: t('auth.emailRequired') });
      return false;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      Toast.show({ type: 'error', text1: t('auth.invalidEmail') });
      return false;
    }
    if (password.length < 6) {
      Toast.show({ type: 'error', text1: t('auth.passwordTooShort') });
      return false;
    }
    if (password !== confirmPassword) {
      Toast.show({ type: 'error', text1: t('auth.passwordsNotMatch') });
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validate()) {
      return;
    }
    try {
      const response = await apiRegister({ email, password });
      if (response?.message) {
        Toast.show({
          type: 'success',
          text1: response.message || t('auth.registerOtpSent'),
        });
        // After successful registration, show OTP input so user can verify
        setOtpSent(true);
      } else {
        Toast.show({
          type: 'warning',
          text1: t('auth.invalidResponse'),
        });
      }
    } catch (error) {
      const err = error as ApiError;
      // If there's already a pending registration, still navigate to OTP screen
      if (err?.message === 'auth.pending_registration_exists') {
        Toast.show({
          type: 'info',
          text1: t('auth.registerOtpSent') || err.message,
        });
        // There is already a pending registration — show OTP input
        setOtpSent(true);
        return;
      }
      Toast.show({
        type: 'error',
        text1: err.message || t('auth.registerFailed'),
      });
    }
  };

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
      const response = await apiVerifyRegisterOtp({ email, otp });

      // After successful verification, do NOT auto-login — send user to Login to sign in.
      Toast.show({ type: 'success', text1: response.message || t('auth.verifySuccess') });
      navigation.navigate(SCREEN_NAME.LOGIN as never);
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
        <View style={styles.card}>
          <Image style={styles.imageLogo} source={LOGO.MAIN} />
          <Text style={styles.title}>{t('auth.signup')}</Text>
        </View>
        {!otpSent && (
          <View>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder={t('auth.email')}
              // placeholderTextColor={'black'}
            />
            <View style={styles.containerPassword}>
              <TextInput
                style={styles.inputPassword}
                placeholder={t('auth.password')}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />

              <TouchableOpacity
                style={styles.eyeContainer}
                onPress={handleShowPassword}
              >
                <Text style={styles.eye}>{showPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.containerPassword}>
              <TextInput
                style={styles.inputPassword}
                placeholder={t('auth.confirmPassword')}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
              />

              <TouchableOpacity
                style={styles.eyeContainer}
                onPress={handleShowPassword}
              >
                <Text style={styles.eye}>{showPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        {otpSent ? (
          <>
            <Text style={styles.subtitle}>{t('auth.registerOtpSent')}</Text>

            <TextInput
              style={styles.input}
              value={otp}
              onChangeText={setOtp}
              placeholder={t('auth.otp')}
              keyboardType="number-pad"
              maxLength={6}
            />

            <View style={styles.buttonWrapper}>
              <Button title={loading ? t('common.loading') : t('auth.verifyOtp')} onPress={handleVerify} />
            </View>

            <TouchableOpacity style={styles.resendButton} onPress={handleResend}>
              <Text style={styles.resendText}>{t('auth.resendOtp')}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setOtpSent(false)}>
              <Text style={styles.backText}>{t('common.back')}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.buttonWrapper}>
            <Button title={t('auth.signup')} onPress={handleRegister} />
          </View>
        )}
        <View style={styles.footerText}>
          <Text>{t('auth.alreadyHaveAccount')}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginText}>{t('auth.loginNow')}</Text>
          </TouchableOpacity>
        </View>
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
  },
  card: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: -20,
  },
  imageLogo: {
    width: 250,
    height: 250,
  },
  buttonWrapper: {
    marginTop: 30,
  },
  footerText: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginText: {
    color: SECONDARY_COLOR,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  input: {
    width: 300,
    height: 50,
    borderBottomWidth: 1,
    borderRadius: 10,
    borderColor: '#636363',
    marginTop: 30,
    paddingHorizontal: 10,
    opacity: 0.8,
  },
  containerPassword: {
    position: 'relative',
    marginTop: 30,
  },
  inputPassword: {
    width: 300,
    height: 50,
    borderBottomWidth: 1,
    borderRadius: 10,
    borderColor: '#636363',
    paddingHorizontal: 10,
    opacity: 0.8,
  },
  eyeContainer: {
    position: 'absolute',
    right: 20,
    top: 15,
  },
  eye: {
    fontSize: 18,
  },
  subtitle: {
    marginTop: 8,
    color: '#666',
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
export default RegisterScreen;
