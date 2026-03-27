import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Body from '../../../components/Layout/Body';
import { ICONGOOGLE, LOGO } from '../../../assets';
import React from 'react';
import Button from '../../../components/Button/Button';
import { useNavigation } from '@react-navigation/native';
import { SCREEN_NAME } from '../../../constants/screenName';
import Toast from 'react-native-toast-message';
import { apiLogin } from './api';
import { useDispatch } from 'react-redux';
import { login } from '../../../reducers/loginReducer';
import { ApiError } from '../../../api';

const LoginScreen = () => {
  const navigation = useNavigation<any>();
  const [showPassword, setShowPassword] = React.useState(false);
  const [email, setEmail] = React.useState('user1@gotogether.com');
  const [password, setPassword] = React.useState('password123');

  const dispatch = useDispatch();

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const validate = () => {
    if (!email) {
      Toast.show({ type: 'error', text1: 'Vui lòng nhập email' });
      return false;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      Toast.show({ type: 'error', text1: 'Email không hợp lệ' });
      return false;
    }
    if (!password) {
      Toast.show({ type: 'error', text1: 'Vui lòng nhập mật khẩu' });
      return false;
    }
    if (password.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Mật khẩu phải có ít nhất 6 ký tự',
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
      const response = await apiLogin({ email, password });
      if (response.status) {
        Toast.show({ type: 'success', text1: 'Đăng nhập thành công' });
        dispatch(
          login({
            user: response.data.user,
            accessToken: response.data.accessToken,
            startDate: response.data.startDate,
          }),
        );

        const user = response.data.user;

        const isInfoComplete = checkInfoUser(user);

        setTimeout(() => {
          if (isInfoComplete) {
            navigation.navigate(SCREEN_NAME.TABS);
          } else {
            navigation.navigate(SCREEN_NAME.UPDATE_INFO);
          }
        }, 300);
      } else {
        Toast.show({
          type: 'warning',
          text1: 'Response không có status',
        });
      }
    } catch (error) {
      const err = error as ApiError;
      Toast.show({
        type: 'error',
        text1: err.message || 'Đăng nhập thất bại',
      });
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
  return (
    <Body hideHeader>
      <View style={styles.container}>
        <View style={styles.card}>
          <Image style={styles.imageLogo} source={LOGO.MAIN} />
          <Text style={styles.title}>Đăng nhập</Text>
        </View>
        <View style={styles.card}>
          <TouchableOpacity style={styles.containerGoogle}>
            <Image style={styles.imageGoogle} source={ICONGOOGLE.GOOGLE} />
            <Text style={styles.textGoogle}>Đăng nhập bằng Google</Text>
          </TouchableOpacity>
        </View>
        <View>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={e => setEmail(e)}
            // placeholderTextColor={'black'}
          />
          <View style={styles.containerPassword}>
            <TextInput
              style={styles.inputPassword}
              placeholder="Mật khẩu"
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
          <Text style={styles.rememberText}>Ghi nhớ đăng nhập</Text>
        </TouchableOpacity>

        <View style={styles.buttonWrapper}>
          <Button title="Đăng nhập" onPress={handleLogin} />
        </View>
        <TouchableOpacity>
          <Text style={styles.textLogin}>Quên mật khẩu?</Text>
        </TouchableOpacity>
        <View style={styles.footerResgister}>
          <Text style={styles.rememberText}>Chưa có tài khoản? </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate(SCREEN_NAME.REGISTER)}
          >
            <Text style={styles.textLogin}>Đăng ký</Text>
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
    marginTop: 30,
    borderWidth: 2,
    padding: 10,
    borderRadius: 10,
    borderColor: '#636363',
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
