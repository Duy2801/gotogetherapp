import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import ImagePicker from 'react-native-image-crop-picker';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser } from '../../reducers/loginReducer';
import { RootState } from '../../reducers/store';
import { PRIMARY_COLOR, SECONDARY_COLOR } from '../../constants/color';
import { SCREEN_NAME } from '../../constants/screenName';
import { uploadService } from '../../services/uploadService';
import { showErrorToast, showSuccessToast } from '../../utils/appToast';
import { updateProfile } from '../setting/api';
import { useTranslation } from '../../hooks/useTranslation';

const UpdateInfoScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.login.user);
  const { t } = useTranslation();
  const fromAuthFlow = Boolean(route.params?.fromAuthFlow);

  const [fullName, setFullName] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [gender, setGender] = useState<number | null>(null);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFullName(currentUser?.fullName || '');
    setAvatar(currentUser?.avatar || null);
    setGender(
      typeof currentUser?.gender === 'number' ? currentUser.gender : null,
    );
    if (currentUser?.dateOfBirth) {
      const parsedDate = new Date(currentUser.dateOfBirth);
      if (!Number.isNaN(parsedDate.getTime())) {
        setDate(parsedDate);
      }
    }
  }, [currentUser]);

  const formatDate = (dateValue: Date) => {
    const day = dateValue.getDate().toString().padStart(2, '0');
    const month = (dateValue.getMonth() + 1).toString().padStart(2, '0');
    const year = dateValue.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const handlePickAvatar = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: 800,
        height: 800,
        cropping: true,
        mediaType: 'photo',
      });

      const uploadedUrl = await uploadService.uploadAvatar(image.path);
      if (uploadedUrl) {
        setAvatar(uploadedUrl);
        showSuccessToast(t('common.success'), t('profile.avatarUploadSuccess'));
      }
    } catch (error: any) {
      if (error?.message?.includes('user cancelled')) {
        return;
      }
      showErrorToast(
        t('common.error'),
        error?.message || t('profile.avatarUploadFailed'),
      );
    }
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      showErrorToast(t('common.error'), t('validation.nameRequired'));
      return;
    }

    try {
      setLoading(true);
      const response = await updateProfile({
        fullName: fullName.trim(),
        dateOfBirth: date.toISOString(),
        gender: gender ?? undefined,
        avatar: avatar ?? undefined,
      });

      if (response.status) {
        dispatch(updateUser(response.data));
        showSuccessToast(t('common.success'), t('profile.updateSuccess'));
        if (fromAuthFlow) {
          navigation.reset({
            index: 0,
            routes: [{ name: SCREEN_NAME.TABS }],
          });
        } else {
          navigation.goBack();
        }
      }
    } catch (error: any) {
      showErrorToast(
        t('common.error'),
        error?.error || error?.message || t('profile.updateFailed'),
      );
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
          <Text style={styles.backText}>{t('common.back')}</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.title}>{t('profile.editProfile')}</Text>
          <Text style={styles.subtitle}>{t('profile.editProfileDesc')}</Text>

          <View style={styles.avatarWrap}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <FontAwesome6
                  name="user"
                  size={28}
                  color="#14532D"
                  iconStyle="solid"
                />
              </View>
            )}

            <TouchableOpacity
              style={styles.avatarButton}
              onPress={handlePickAvatar}
            >
              <FontAwesome6
                name="camera"
                size={12}
                color="#fff"
                iconStyle="solid"
              />
              <Text style={styles.avatarButtonText}>
                {t('profile.changeAvatar')}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.label}>{t('profile.fullName')}</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder={t('profile.fullNamePlaceholder')}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.label}>{t('profile.gender')}</Text>
            <View style={styles.genderRow}>
              <TouchableOpacity
                style={[
                  styles.genderItem,
                  gender === 0 && styles.genderItemActive,
                ]}
                onPress={() => setGender(0)}
              >
                <Text
                  style={[
                    styles.genderText,
                    gender === 0 && styles.genderTextActive,
                  ]}
                >
                  {t('profile.male')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.genderItem,
                  gender === 1 && styles.genderItemActive,
                ]}
                onPress={() => setGender(1)}
              >
                <Text
                  style={[
                    styles.genderText,
                    gender === 1 && styles.genderTextActive,
                  ]}
                >
                  {t('profile.female')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.label}>{t('profile.dateOfBirth')}</Text>
            <TouchableOpacity
              style={styles.dateInputContainer}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateText}>{formatDate(date)}</Text>
              <FontAwesome6
                name="calendar-days"
                size={14}
                color="#6B7280"
                iconStyle="solid"
              />
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={onDateChange}
                maximumDate={new Date()}
              />
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              loading && styles.submitButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>{t('common.save')}</Text>
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
    paddingBottom: 28,
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
    marginTop: 6,
    marginBottom: 18,
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  avatarWrap: {
    alignItems: 'center',
    marginBottom: 18,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: '#D1FAE5',
  },
  avatarFallback: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarButton: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: SECONDARY_COLOR,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  avatarButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
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
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  genderRow: {
    flexDirection: 'row',
    gap: 10,
  },
  genderItem: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  genderItemActive: {
    borderColor: '#16A34A',
    backgroundColor: '#DCFCE7',
  },
  genderText: {
    color: '#374151',
    fontWeight: '700',
  },
  genderTextActive: {
    color: '#166534',
  },
  dateInputContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: '#F9FAFB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
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

export default UpdateInfoScreen;
