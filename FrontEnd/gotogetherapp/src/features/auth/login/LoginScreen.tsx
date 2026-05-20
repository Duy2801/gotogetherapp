import { ActivityIndicator, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Body from '../../../components/Layout/Body';
import { LOGO } from '../../../assets';
import React from 'react';
import Button from '../../../components/Button/Button';
import GoogleSignInButton from '../../../components/GoogleSignInButton';
import { useNavigation } from '@react-navigation/native';
import { SCREEN_NAME } from '../../../constants/screenName';
import Toast from 'react-native-toast-message';
import {showSuccessToast, showErrorToast} from '../../../utils/appToast';
import { apiLogin } from './api';
import { apiGoogleLogin } from './api';
import { useDispatch } from 'react-redux';
import { login } from '../../../reducers/loginReducer';
import { ApiError } from '../../../api';
import { useTranslation } from '../../../hooks/useTranslation';
import { getGoogleSignin, getGoogleSignInStatusCodes } from '../../../services/googleSignin';

const LoginScreen = () => {
  const navigation = useNavigation<any>();
  const [showPassword, setShowPassword] = React.useState(false);
  const [email, setEmail] = React.useState('user1@gotogether.com');
  const [password, setPassword] = React.useState('password123');
  const [googleLoading, setGoogleLoading] = React.useState(false);

  const dispatch = useDispatch();
  const { t } = useTranslation();

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const validate = () => {
    if (!email) {
      showErrorToast(t('common.error'), t('validation.emailRequired'));
      return false;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      Toast.show({ type: 'error', text1: t('validation.invalidEmail') });
      return false;
    }
    if (!password) {
      Toast.show({ type: 'error', text1: t('validation.passwordRequired') });
      return false;
    }
    if (password.length < 6) {
      Toast.show({
        type: 'error',
        text1: t('validation.passwordTooShort'),
      });
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validate()) {
      return;
    }
    try {
      const response = (await apiLogin({ email, password })) as any;
      console.log('apiLogin response:', response);
      if (response?.accessToken) {
        showSuccessToast(t('common.success'), t('auth.loginSuccess'));
        dispatch(
          login({
            user: response.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            startDate: response.startDate,
          }),
        );

        const user = response.user;

        const isInfoComplete = checkInfoUser(user);

        setTimeout(() => {
          if (isInfoComplete) {
            navigation.navigate(SCREEN_NAME.TABS);
          } else {
            navigation.replace(SCREEN_NAME.UPDATE_INFO, {
              fromAuthFlow: true,
            });
          }
        }, 300);
      } else {
        // Show debug info when response doesn't include tokens
        console.log('Login response missing accessToken:', response);
        showErrorToast(t('common.error'), response && typeof response === 'object' ? JSON.stringify(response) : t('auth.invalidResponse'));
      }
    } catch (error) {
      const err = error as ApiError;
      showErrorToast(t('common.error'), err.message || t('auth.loginFailed'));
    }
  };
  const checkInfoUser = (user: any) => {
    const requiredFields = ['fullName', 'dateOfBirth', 'gender'];

    return requiredFields.every(field => {
      const value = user[field];
      if (value === null || value === undefined) {
        return false;
      }
      if (typeof value === 'string' && value.trim() === '') {
        return false;
      }
      return true;
    });
  };

  const navigateAfterLogin = React.useCallback(
    (user: any) => {
      const isInfoComplete = checkInfoUser(user);
      setTimeout(() => {
        if (isInfoComplete) {
          navigation.navigate(SCREEN_NAME.TABS);
        } else {
          navigation.replace(SCREEN_NAME.UPDATE_INFO, {
            fromAuthFlow: true,
          });
        }
      }, 300);
    },
    [navigation],
  );

  const handleGoogleLogin = async () => {
    console.log('[Auth] Google sign-in pressed');
    setGoogleLoading(true);
    const statusCodes = getGoogleSignInStatusCodes();
    try {
      const googleSignin = getGoogleSignin();
      console.log('[Auth] getGoogleSignin ->', !!googleSignin);
      if (!googleSignin?.hasPlayServices || !googleSignin?.signIn) {
        throw new Error('Google Sign-In module could not be loaded');
      }

      console.log('[Auth] checking play services');
      Toast.show({ type: 'info', text1: 'Đang mở Google Sign-In...' });
      await googleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      console.log('[Auth] calling signIn()');
      const signInResult = await googleSignin.signIn();
      console.log('[Auth] signIn result:', signInResult);
      const tokens = googleSignin.getTokens ? await googleSignin.getTokens() : null;
      console.log('[Auth] tokens:', tokens);
      const idToken = signInResult?.idToken || tokens?.idToken;

      if (!idToken) {
        throw new Error(t('auth.invalidResponse'));
      }

      const response = (await apiGoogleLogin({ idToken })) as any;

      if (response?.accessToken) {
        showSuccessToast(t('common.success'), t('auth.loginSuccess'));
        dispatch(
          login({
            user: response.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            startDate: response.startDate,
          }),
        );

        navigateAfterLogin(response.user);
      } else {
        showErrorToast(
          t('common.error'),
          response && typeof response === 'object'
            ? JSON.stringify(response)
            : t('auth.invalidResponse'),
        );
      }
    } catch (error: any) {
      if (
        error?.code === statusCodes.SIGN_IN_CANCELLED ||
        error?.code === 'SIGN_IN_CANCELLED'
      ) {
        return;
      }

      if (
        error?.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE ||
        error?.code === 'PLAY_SERVICES_NOT_AVAILABLE'
      ) {
        showErrorToast(t('common.error'), t('auth.loginFailed'));
        return;
      }

      const err = error as ApiError;
      showErrorToast(t('common.error'), err.message || t('auth.loginFailed'));
    } finally {
      setGoogleLoading(false);
    }
  };

  // Google sign-in handling removed — visual-only button remains

  
  return (
    <Body hideHeader>
      <View style={styles.container}>
        <View style={styles.card}>
          <Image style={styles.imageLogo} source={LOGO.MAIN} />
          <Text style={styles.title}>{t('auth.login')}</Text>
        </View>
          <View style={styles.containerGoogle}>
            <GoogleSignInButton
              onPress={handleGoogleLogin}
              loading={googleLoading}
              disabled={googleLoading}
            />
          </View>
        <View>
          <TextInput
            style={styles.input}
            placeholder={t('auth.email')}
            value={email}
            onChangeText={e => setEmail(e)}
            // placeholderTextColor={'black'}
          />
          <View style={styles.containerPassword}>
            <TextInput
              style={styles.inputPassword}
              placeholder={t('auth.password')}
              value={password}
              onChangeText={e => setPassword(e)}
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
        <TouchableOpacity style={styles.boxRegister}>
          <View style={[styles.checkbox]} />
          <Text style={styles.rememberText}>{t('auth.rememberLogin')}</Text>
        </TouchableOpacity>

        <View style={styles.buttonWrapper}>
          <Button title={t('auth.login')} onPress={handleLogin} />
        </View>
          <TouchableOpacity onPress={() => navigation.navigate(SCREEN_NAME.FORGOT_PASSWORD as never)}>
          <Text style={styles.textLogin}>{t('auth.forgotPassword')}</Text>
        </TouchableOpacity>
        <View style={styles.footerResgister}>
          <Text style={styles.rememberText}>{t('auth.dontHaveAccount')} </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate(SCREEN_NAME.REGISTER)}
          >
            <Text style={styles.textLogin}>{t('auth.signup')}</Text>
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
  containerGoogle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    paddingHorizontal: 45,
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
  imageGoogle: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  imageLogo: {
    width: 250,
    height: 250,
  },
  textGoogle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 10,
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
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#aaa',
    marginRight: 8,
  },
  rememberText: {
    fontSize: 14,
  },
  boxRegister: {
    flexDirection: 'row',
    marginTop: 20,
    left: 10,
    alignSelf: 'flex-start',
  },
  textLogin: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonWrapper: {
    marginTop: 30,
  },
  footerResgister: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    alignItems: 'center',
  },
  eye: {
    fontSize: 18,
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
});
export default LoginScreen;
