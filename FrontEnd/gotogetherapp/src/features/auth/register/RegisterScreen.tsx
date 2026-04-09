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
import { SECONDARY_COLOR } from '../../../constants/color';
import { useState } from 'react';
import Button from '../../../components/Button/Button';
import { useTranslation } from '../../../hooks/useTranslation';
import Toast from 'react-native-toast-message';
import { apiRegister } from '../login/api';
import { SCREEN_NAME } from '../../../constants/screenName';
import { ApiError } from '../../../api';

const RegisterScreen = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfrimPassword] = useState('');

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  const navigation = useNavigation<any>();

  const validate = () => {
    return true;
  };

  const handleRegister = async () => {
    if (!validate()) {
      return;
    }
    try {
      const response = await apiRegister({ email, password });
      if (response.status) {
        Toast.show({
          type: 'success',
          text1: response.data?.message || t('auth.registerSuccess'),
        });
        navigation.navigate(SCREEN_NAME.LOGIN);
      } else {
        Toast.show({
          type: 'warning',
          text1: t('auth.invalidResponse'),
        });
      }
    } catch (error) {
      const err = error as ApiError;
      Toast.show({
        type: 'error',
        text1: err.message || t('auth.registerFailed'),
      });
    }
  };
  return (
    <Body hideHeader>
      <View style={styles.container}>
        <View style={styles.card}>
          <Image style={styles.imageLogo} source={LOGO.MAIN} />
          <Text style={styles.title}>{t('auth.signup')}</Text>
        </View>
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
              onChangeText={setConfrimPassword}
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
        <View style={styles.buttonWrapper}>
          <Button title={t('auth.signup')} onPress={handleRegister} />
        </View>
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
});
export default RegisterScreen;
