import React from 'react';
import {
  Alert,
  ActivityIndicator,
  Image,
  Pressable,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { PRIMARY_COLOR, SECONDARY_COLOR } from '../../constants/color';
import { useDispatch } from 'react-redux';
import { logout } from '../../reducers/loginReducer';
import { useNavigation } from '@react-navigation/native';
import { SCREEN_NAME } from '../../constants/screenName';
import { useSelector } from 'react-redux';
import { RootState } from '../../reducers/store';
import { apiLogout } from './api';
import { useTranslation } from '../../hooks/useTranslation';
import { showSuccessToast } from '../../utils/appToast';
import { setLocale } from '../../reducers/localeReducer';

const SettingScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const currentUser = useSelector((state: RootState) => state.login.user);
  const { t, locale } = useTranslation();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const [showLanguageModal, setShowLanguageModal] = React.useState(false);

  const handleOpenUpdateInfo = () => {
    navigation.navigate(SCREEN_NAME.UPDATE_INFO);
  };

  const handleOpenChangePassword = () => {
    navigation.navigate(SCREEN_NAME.CHANGE_PASSWORD);
  };

  const handleOpenHistory = () => {
    navigation.navigate(SCREEN_NAME.HISTORY);
  };

  const handleLanguageChange = async (nextLocale: 'vi' | 'en') => {
    dispatch(setLocale(nextLocale));
    setShowLanguageModal(false);
    showSuccessToast(
      t('common.success'),
      nextLocale === 'vi'
        ? t('setting.languageChangedVi')
        : t('setting.languageChangedEn'),
    );
  };

  const handleLogout = () => {
    Alert.alert(t('common.logout'), t('setting.confirmLogout'), [
      {
        text: t('common.cancel'),
        style: 'cancel',
      },
      {
        text: t('common.logout'),
        style: 'destructive',
        onPress: performLogout,
      },
    ]);
  };

  const performLogout = async () => {
    setIsLoggingOut(true);
    try {
      await apiLogout();

      dispatch(logout());

      navigation.reset({
        index: 0,
        routes: [{ name: SCREEN_NAME.LOGIN }],
      });
    } catch (error: any) {
      console.log('Logout API failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const settingItems = [
    {
      key: 'password',
      title: t('setting.changePassword'),
      subtitle: t('setting.changePasswordDesc'),
      icon: 'lock',
      onPress: handleOpenChangePassword,
    },
    {
      key: 'history',
      title: t('setting.viewHistory'),
      subtitle: t('setting.historyDesc'),
      icon: 'clock-rotate-left',
      onPress: handleOpenHistory,
    },
    {
      key: 'language',
      title: t('setting.language'),
      subtitle: locale === 'vi' ? 'Tiếng Việt' : 'English',
      icon: 'language',
      onPress: () => setShowLanguageModal(true),
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerCard}>
          <View style={styles.profileCenter}>
            {currentUser?.avatar ? (
              <Image
                source={{ uri: currentUser.avatar }}
                style={styles.avatarLarge}
              />
            ) : (
              <View style={styles.avatarLargeFallback}>
                <FontAwesome6
                  name="user"
                  size={40}
                  color="#fff"
                  iconStyle="solid"
                />
              </View>
            )}
            <Text style={styles.nameLarge} numberOfLines={1}>
              {currentUser?.fullName || 'Người dùng'}
            </Text>
            <Text style={styles.emailLarge} numberOfLines={1}>
              {currentUser?.email || 'Chưa có email'}
            </Text>
          </View>

          <Pressable style={styles.editButtonFull} onPress={handleOpenUpdateInfo}>
            <Text style={styles.editButtonFullText}>
              {t('profile.editProfile')}
            </Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('setting.account')}</Text>
          <View style={styles.menuCard}>
            {settingItems.map(item => (
              <TouchableOpacity
                key={item.key}
                style={styles.menuItem}
                onPress={item.onPress}
              >
                <View style={styles.menuIconWrap}>
                  <FontAwesome6
                    name={item.icon as any}
                    size={14}
                    color="#16A34A"
                    iconStyle="solid"
                  />
                </View>
                <View style={styles.menuTextWrap}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
                <FontAwesome6
                  name="chevron-right"
                  size={12}
                  color="#9CA3AF"
                  iconStyle="solid"
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('setting.support')}</Text>
          <View style={styles.menuCard}>
            <View style={styles.infoBlock}>
              <Text style={styles.infoTitle}>{t('setting.appVersion')}</Text>
              <Text style={styles.infoValue}>GoTogether • 1.0.0</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoBlock}>
              <Text style={styles.infoTitle}>{t('setting.status')}</Text>
              <Text style={styles.infoValue}>{t('setting.active')}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.logoutButton,
            isLoggingOut && styles.logoutButtonDisabled,
          ]}
          onPress={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <FontAwesome6
                name="right-from-bracket"
                size={14}
                color="#fff"
                iconStyle="solid"
              />
              <Text style={styles.logoutText}>{t('common.logout')}</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={showLanguageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setShowLanguageModal(false)}
          />
          <View style={styles.languageCard}>
            <Text style={styles.modalTitle}>{t('setting.chooseLanguage')}</Text>

            <TouchableOpacity
              style={[
                styles.languageOption,
                locale === 'vi' && styles.languageOptionActive,
              ]}
              onPress={() => handleLanguageChange('vi')}
            >
              <Text
                style={[
                  styles.languageOptionText,
                  locale === 'vi' && styles.languageOptionTextActive,
                ]}
              >
                {t('setting.vietnamese')}
              </Text>
              {locale === 'vi' && (
                <FontAwesome6
                  name="check"
                  size={12}
                  color="#166534"
                  iconStyle="solid"
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.languageOption,
                locale === 'en' && styles.languageOptionActive,
              ]}
              onPress={() => handleLanguageChange('en')}
            >
              <Text
                style={[
                  styles.languageOptionText,
                  locale === 'en' && styles.languageOptionTextActive,
                ]}
              >
                {t('setting.english')}
              </Text>
              {locale === 'en' && (
                <FontAwesome6
                  name="check"
                  size={12}
                  color="#166534"
                  iconStyle="solid"
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCancelBtn}
              onPress={() => setShowLanguageModal(false)}
            >
              <Text style={styles.actionCancelText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#EAF5ED',
  },
  container: {
    flex: 1,
    backgroundColor: '#EAF5ED',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    alignItems: 'stretch',
  },
  headerCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 28,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  profileCenter: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#D1FAE5',
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#EC4899',
  },
  avatarLargeFallback: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#EC4899',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#EC4899',
  },
  nameLarge: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
    textAlign: 'center',
  },
  emailLarge: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
  editButtonFull: {
    width: '100%',
    backgroundColor: '#10B981',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonFullText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  section: {
    width: '100%',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#14532D',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextWrap: {
    flex: 1,
    marginLeft: 12,
    marginRight: 10,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 3,
    lineHeight: 16,
  },
  infoBlock: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  infoTitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEF2F7',
  },
  logoutButton: {
    backgroundColor: SECONDARY_COLOR,
    paddingVertical: 15,
    borderRadius: 18,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  logoutButtonDisabled: {
    opacity: 0.7,
  },
  logoutText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    padding: 20,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  languageCard: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 18,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 14,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  languageOptionActive: {
    borderColor: '#16A34A',
    backgroundColor: '#DCFCE7',
  },
  languageOptionText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '700',
  },
  languageOptionTextActive: {
    color: '#166534',
  },
  actionCancelBtn: {
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
  },
  actionCancelText: {
    color: '#111827',
    fontWeight: '700',
  },
});

export default SettingScreen;
