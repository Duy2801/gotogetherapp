import React, { useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { useNavigation } from '@react-navigation/native';
import { PRIMARY_COLOR, SECONDARY_COLOR } from '../../../constants/color';
import { changePassword } from '../api';
import { showErrorToast, showSuccessToast } from '../../../utils/appToast';
import { useTranslation } from '../../../hooks/useTranslation';

const ChangePasswordScreen = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      showErrorToast(
        t('common.error'),
        t('validation.required', { field: t('setting.oldPassword') }),
      );
      return;
    }

    if (newPassword.length < 6) {
      showErrorToast(t('common.error'), t('setting.passwordMustBeAtLeast6'));
      return;
    }

    if (newPassword !== confirmPassword) {
      showErrorToast(t('common.error'), t('setting.passwordMustMatch'));
      return;
    }

    try {
      setLoading(true);
      await changePassword({ oldPassword, newPassword });
      showSuccessToast(t('common.success'), t('setting.changePasswordSuccess'));
      navigation.goBack();
    } catch (error: any) {
      const message =
        error?.error || error?.message || t('setting.couldNotChangePassword');
      if (message.includes('password_incorrect')) {
        showErrorToast(
          t('common.error'),
          t('setting.currentPasswordIncorrect'),
        );
      } else if (message.includes('password_not_set')) {
        showErrorToast(t('common.error'), t('setting.accountHasNoPassword'));
      } else {
        showErrorToast(t('common.error'), message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <FontAwesome6
            name="angle-left"
            size={18}
            color="#111827"
            iconStyle="solid"
          />
          <Text style={styles.backText}>{t('setting.back')}</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.title}>{t('setting.changePasswordTitle')}</Text>
          <Text style={styles.subtitle}>
            {t('setting.changePasswordSubtitle')}
          </Text>

          <View style={styles.fieldBlock}>
            <Text style={styles.label}>{t('setting.currentPassword')}</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                value={oldPassword}
                onChangeText={setOldPassword}
                placeholder={t('setting.enterCurrentPassword')}
                secureTextEntry={!showOldPassword}
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity
                onPress={() => setShowOldPassword(prev => !prev)}
              >
                <FontAwesome6
                  name={showOldPassword ? 'eye-slash' : 'eye'}
                  size={14}
                  color="#6B7280"
                  iconStyle="solid"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.label}>{t('setting.newPassword')}</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder={t('setting.enterNewPassword')}
                secureTextEntry={!showNewPassword}
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity
                onPress={() => setShowNewPassword(prev => !prev)}
              >
                <FontAwesome6
                  name={showNewPassword ? 'eye-slash' : 'eye'}
                  size={14}
                  color="#6B7280"
                  iconStyle="solid"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.label}>{t('setting.confirmPassword')}</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder={t('setting.enterConfirmPassword')}
              secureTextEntry
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              loading && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>Cập nhật mật khẩu</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#EAF5ED',
  },
  content: {
    padding: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  backText: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 6,
    marginBottom: 18,
  },
  fieldBlock: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 16,
    paddingHorizontal: 14,
    backgroundColor: '#F9FAFB',
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    color: '#111827',
  },
  submitButton: {
    marginTop: 10,
    backgroundColor: SECONDARY_COLOR,
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
});

export default ChangePasswordScreen;
