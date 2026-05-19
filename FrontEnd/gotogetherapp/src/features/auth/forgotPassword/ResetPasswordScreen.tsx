import {useNavigation, useRoute} from '@react-navigation/native';
import React, {useState} from 'react';
import {StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import Toast from 'react-native-toast-message';
import {showSuccessToast, showErrorToast} from '../../../utils/appToast';
import Body from '../../../components/Layout/Body';
import Button from '../../../components/Button/Button';
import {useTranslation} from '../../../hooks/useTranslation';
import {apiResetPasswordOtp} from '../login/api';
import {SCREEN_NAME} from '../../../constants/screenName';

const ResetPasswordScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const {t} = useTranslation();

  const [email] = useState(route.params?.email || '');
  const [otp] = useState(route.params?.otp || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email.trim()) {
      Toast.show({type: 'error', text1: t('auth.emailRequired')});
      return;
    }
    if (otp.trim().length !== 6) {
      Toast.show({type: 'error', text1: t('auth.otpRequired')});
      return;
    }
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
      showSuccessToast(t('common.success'), response.message || t('auth.resetSuccess'));
      navigation.navigate(SCREEN_NAME.LOGIN as never);
    } catch (err: any) {
      showErrorToast(t('common.error'), err.message || t('auth.resetFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Body hideHeader>
      <View style={styles.container}>
        <Text style={styles.title}>{t('auth.resetPassword')}</Text>

        <TextInput style={styles.input} value={email} editable={false} />
        <TextInput style={styles.input} value={otp} editable={false} />

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
});

export default ResetPasswordScreen;
