import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import { useSelector } from 'react-redux';
import { PRIMARY_COLOR, SECONDARY_COLOR } from '../../../constants/color';
import { RootState } from '../../../reducers/store';
import { showErrorToast, showSuccessToast } from '../../../utils/appToast';
import { Category, Member, tripDetailApi } from '../api';
import { useTranslation } from '../../../hooks/useTranslation';

interface AddExpenseScreenProps {
  route: {
    params: {
      tripId: string;
      onExpenseAdded?: () => void;
    };
  };
  navigation: any;
}

type SplitMode = 'EQUAL' | 'PERCENTAGE' | 'PERSONAL';

const categoryFallbackIcon: Record<string, string> = {
  'Ăn uống': '🍽️',
  'Di chuyển': '🚗',
  'Uống nước': '☕',
  'Nhà nghỉ': '🏨',
  'Giải trí': '🎉',
  'Mua sắm': '🛍️',
  Khác: '💰',
};

const getApiErrorMessage = (error: any, fallback: string) => {
  const apiMessage = error?.response?.data?.message;

  if (Array.isArray(apiMessage) && apiMessage.length) {
    return String(apiMessage[0]);
  }

  if (typeof apiMessage === 'string' && apiMessage.trim()) {
    return apiMessage;
  }

  if (
    typeof error?.response?.data?.error === 'string' &&
    error.response.data.error.trim()
  ) {
    return error.response.data.error;
  }

  if (typeof error?.message === 'string' && error.message.trim()) {
    return error.message;
  }

  if (typeof error?.error === 'string' && error.error.trim()) {
    return error.error;
  }

  return fallback;
};

const AddExpenseScreen: React.FC<AddExpenseScreenProps> = ({
  route,
  navigation,
}) => {
  const { tripId, onExpenseAdded } = route.params;
  const user = useSelector((state: RootState) => state.login.user);
  const { t, locale } = useTranslation();

  const [amountText, setAmountText] = useState('');
  const [description, setDescription] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date());
  const [openDatePicker, setOpenDatePicker] = useState(false);

  const [members, setMembers] = useState<Member[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [splitMode, setSplitMode] = useState<SplitMode>('EQUAL');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const acceptedMembers = useMemo(
    () => members.filter(member => member.inviteStatus === 'ACCEPTED'),
    [members],
  );

  const amount = useMemo(
    () => Number(amountText.replace(/\./g, '') || '0'),
    [amountText],
  );

  const selectedParticipants = useMemo(() => {
    if (splitMode === 'PERSONAL') {
      const me = acceptedMembers.find(member => member.userId === user?.id);
      if (me) {
        return [me.userId];
      }
      return acceptedMembers[0] ? [acceptedMembers[0].userId] : [];
    }

    return acceptedMembers.map(member => member.userId);
  }, [acceptedMembers, splitMode, user?.id]);

  const paidById = useMemo(() => {
    const me = acceptedMembers.find(member => member.userId === user?.id);
    return me?.userId || acceptedMembers[0]?.userId || '';
  }, [acceptedMembers, user?.id]);

  const perMemberAmount = useMemo(() => {
    if (!selectedParticipants.length || !amount) {
      return 0;
    }
    return amount / selectedParticipants.length;
  }, [amount, selectedParticipants.length]);

  useEffect(() => {
    const initData = async () => {
      try {
        const [tripResponse, categoryResponse] = await Promise.all([
          tripDetailApi.getTripDetail(tripId),
          tripDetailApi.getExpenseCategories(tripId),
        ]);

        if (tripResponse.status) {
          setMembers(tripResponse.data.members || []);
        }

        if (categoryResponse.status) {
          const loadedCategories = categoryResponse.data || [];
          setCategories(loadedCategories);
          if (loadedCategories[0]) {
            setSelectedCategoryId(loadedCategories[0].id);
          }
        }
      } catch (error: any) {
        showErrorToast(
          t('common.error'),
          getApiErrorMessage(error, t('expense.loadFailed')),
        );
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [tripId]);

  const formatDate = (date: Date) =>
    date.toLocaleDateString(locale === 'en' ? 'en-US' : 'vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  const handleAmountChange = (text: string) => {
    const digits = text.replace(/\D/g, '');
    if (!digits) {
      setAmountText('');
      return;
    }

    const normalized = Number(digits).toLocaleString('vi-VN');
    setAmountText(normalized.replace(/,/g, '.'));
  };

  const handleSplitModeChange = (mode: SplitMode) => {
    setSplitMode(mode);
  };

  const validateForm = () => {
    if (!amount || amount <= 0) {
      showErrorToast(t('common.error'), t('expense.invalidAmount'));
      return false;
    }

    if (!selectedCategoryId) {
      showErrorToast(t('common.error'), t('expense.selectCategory'));
      return false;
    }

    if (!paidById) {
      showErrorToast(t('common.error'), t('expense.payerNotFound'));
      return false;
    }

    if (!selectedParticipants.length) {
      showErrorToast(t('common.error'), t('expense.noMembersToSplit'));
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      const splitTypePayload =
        splitMode === 'PERCENTAGE' ? 'PERCENTAGE' : 'EQUAL';

      let customSplits:
        | {
            userId: string;
            amount: number;
          }[]
        | undefined;

      if (splitMode === 'PERCENTAGE') {
        const percentPer = Number(
          (100 / selectedParticipants.length).toFixed(2),
        );
        let remaining = Number((100).toFixed(2));

        customSplits = selectedParticipants.map((participantId, idx) => {
          const percentage =
            idx === selectedParticipants.length - 1
              ? Number(remaining.toFixed(2))
              : percentPer;

          remaining = Number((remaining - percentage).toFixed(2));

          return {
            userId: participantId,
            amount: percentage,
          };
        });
      }

      const response = await tripDetailApi.createExpense(tripId, {
        amount,
        currency: 'VND',
        categoryId: selectedCategoryId,
        description: description.trim(),
        paidById,
        splitType: splitTypePayload,
        participants: selectedParticipants,
        date: expenseDate.toISOString(),
        customSplits,
      });

      if (response.status) {
        showSuccessToast(t('common.success'), t('expense.addSuccess'));
        onExpenseAdded?.();
        navigation.goBack();
      }
    } catch (error: any) {
      showErrorToast(
        t('common.error'),
        getApiErrorMessage(error, t('expense.addFailed')),
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => navigation.goBack()}
        />
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.overlay}>
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardWrap}
      >
        <View style={styles.formCard}>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>{t('expense.addExpense')}</Text>
          </View>

          <View style={styles.formContent}>
            <Text style={styles.label}>{t('expense.amount')}</Text>
            <View style={styles.inputRow}>
              <TextInput
                value={amountText}
                onChangeText={handleAmountChange}
                placeholder={t('expense.amountPlaceholder')}
                placeholderTextColor="#BDBDBD"
                keyboardType="numeric"
                style={styles.input}
              />
              <Text style={styles.inputSuffix}>đ</Text>
            </View>

            <Text style={styles.label}>{t('expense.description')}</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder={t('expense.descriptionPlaceholder')}
              placeholderTextColor="#BDBDBD"
              style={styles.inputStandalone}
            />

            <Text style={styles.label}>{t('expense.date')}</Text>
            <TouchableOpacity
              style={styles.inputRow}
              onPress={() => setOpenDatePicker(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.dateText}>{formatDate(expenseDate)}</Text>
              <Text style={styles.calendarIcon}>🗓️</Text>
            </TouchableOpacity>

            <Text style={styles.label}>{t('expense.category')}</Text>
            <View style={styles.categoryGrid}>
              {categories.slice(0, 6).map(category => {
                const selected = category.id === selectedCategoryId;
                return (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryCard,
                      selected && styles.categoryCardActive,
                    ]}
                    onPress={() => setSelectedCategoryId(category.id)}
                    activeOpacity={0.75}
                  >
                    {category.icon ? (
                      <Image
                        source={{ uri: category.icon }}
                        style={styles.categoryIcon}
                      />
                    ) : (
                      <Text style={styles.categoryIconEmoji}>
                        {categoryFallbackIcon[category.name] || '💰'}
                      </Text>
                    )}
                    <Text style={styles.categoryText} numberOfLines={1}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.label}>{t('expense.splitWith')}</Text>
            <View style={styles.splitWrapper}>
              <TouchableOpacity
                style={[
                  styles.splitButton,
                  splitMode === 'EQUAL' && styles.splitButtonActive,
                ]}
                onPress={() => handleSplitModeChange('EQUAL')}
                activeOpacity={0.75}
              >
                <Text style={styles.splitEmoji}>🧑‍🤝‍🧑</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.splitButton}
                onPress={() => handleSplitModeChange('PERCENTAGE')}
                activeOpacity={0.75}
              >
                <Text style={styles.splitEmoji}>%</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.splitButton,
                  splitMode === 'PERSONAL' && styles.splitButtonActive,
                ]}
                onPress={() => handleSplitModeChange('PERSONAL')}
                activeOpacity={0.75}
              >
                <Text style={styles.splitEmoji}>👤</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t('expense.paidBy')}</Text>
                <Text style={styles.summaryValue}>{amountText || '0'} đ</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  {t('expense.splitAmount')}
                </Text>
                <Text style={styles.summaryValueHighlight}>
                  {Math.round(perMemberAmount)
                    .toLocaleString('vi-VN')
                    .replace(/,/g, '.')}{' '}
                  đ
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                submitting && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {t('expense.addExpense')}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      <DatePicker
        modal
        mode="date"
        open={openDatePicker}
        date={expenseDate}
        title={t('expense.chooseDate')}
        confirmText={t('common.confirm')}
        cancelText={t('common.cancel')}
        onConfirm={date => {
          setOpenDatePicker(false);
          setExpenseDate(date);
        }}
        onCancel={() => setOpenDatePicker(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  keyboardWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  formCard: {
    backgroundColor: '#F0F5F1',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D9E3DD',
    overflow: 'hidden',
  },
  headerRow: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#DFE7E2',
    backgroundColor: '#F6FAF7',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2A24',
    textAlign: 'center',
  },
  formContent: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 12,
  },
  label: {
    marginTop: 9,
    marginBottom: 5,
    fontSize: 14,
    fontWeight: '600',
    color: '#3f4944',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputStandalone: {
    borderRadius: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    height: 46,
    paddingVertical: 0,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 14,
    color: '#222',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#222',
  },
  inputSuffix: {
    fontSize: 14,
    color: '#9FA4A3',
    fontWeight: '600',
  },
  dateText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  calendarIcon: {
    fontSize: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryCard: {
    width: '31%',
    minHeight: 78,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  categoryCardActive: {
    borderColor: SECONDARY_COLOR,
    backgroundColor: '#edfff4',
  },
  categoryIcon: {
    width: 26,
    height: 26,
    resizeMode: 'contain',
    marginBottom: 4,
  },
  categoryIconEmoji: {
    fontSize: 22,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 11,
    color: '#333',
    fontWeight: '400',
    textAlign: 'center',
  },
  splitWrapper: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
    marginTop: 4,
  },
  splitButton: {
    flex: 1,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splitButtonActive: {
    backgroundColor: SECONDARY_COLOR,
  },
  splitEmoji: {
    fontSize: 16,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#555',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
  },
  summaryValueHighlight: {
    color: '#E53935',
    fontSize: 13,
    fontWeight: '700',
  },
  submitButton: {
    marginTop: 14,
    borderRadius: 10,
    backgroundColor: SECONDARY_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  loadingCard: {
    marginHorizontal: 28,
    borderRadius: 14,
    backgroundColor: '#F0F5F1',
    paddingVertical: 24,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#555',
  },
});

export default AddExpenseScreen;
