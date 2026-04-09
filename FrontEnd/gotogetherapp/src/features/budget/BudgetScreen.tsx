import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { PRIMARY_COLOR, SECONDARY_COLOR } from '../../constants/color';
import { SCREEN_NAME } from '../../constants/screenName';
import { Budget, budgetApi } from './api';
import { spendingApi, SpendingPaymentSummary } from '../spending/api';
import { formatCompactMoney, formatCurrency } from '../../utils/format';
import { showErrorToast, showSuccessToast } from '../../utils/appToast';
import { useTranslation } from '../../hooks/useTranslation';

const currentMonth = new Date().getMonth() + 1;
const currentYear = new Date().getFullYear();

const getBudgetDisplayState = (budget: Budget) => {
  const spent = budget.spent || 0;
  const amount = budget.amount || 0;
  const remaining = budget.remaining ?? amount - spent;
  const overflowAmount = remaining < 0 ? Math.abs(remaining) : 0;
  const isOverBudget = budget.isOverBudget ?? overflowAmount > 0;

  return {
    spent,
    amount,
    remaining,
    overflowAmount,
    isOverBudget,
    progressPercent: Math.min(budget.percentage || 0, 100),
  };
};

const BudgetScreen = ({ navigation }: { navigation: any }) => {
  const { t } = useTranslation();
  const [budget, setBudget] = useState<Budget | null>(null);
  const [paymentSummary, setPaymentSummary] =
    useState<SpendingPaymentSummary | null>(null);

  // Inline form state
  const [showForm, setShowForm] = useState(false);
  const [budgetAmount, setBudgetAmount] = useState('');
  const [warningAt, setWarningAt] = useState('80');
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const amountInputRef = useRef<TextInput>(null);

  const fetchBudget = useCallback(async () => {
    try {
      const budgetData = await budgetApi.getBudget();
      setBudget(budgetData);
    } catch {
      // Bỏ qua nếu chưa có budget
    }
  }, []);

  const fetchPaymentSummary = useCallback(async () => {
    try {
      const paymentData = await spendingApi.getPaymentSummary();
      setPaymentSummary(paymentData);
    } catch {
      // Bỏ qua lỗi nếu không có dữ liệu
    }
  }, []);

  // Auto-refresh khi focus vào màn hình (sau khi thêm/sửa category budget)
  useFocusEffect(
    useCallback(() => {
      fetchBudget();
      fetchPaymentSummary();
    }, [fetchBudget, fetchPaymentSummary]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchBudget(), fetchPaymentSummary()]);
    setRefreshing(false);
  }, [fetchBudget, fetchPaymentSummary]);

  const openForm = () => {
    setBudgetAmount(budget?.amount ? String(Math.round(budget.amount)) : '');
    setWarningAt(budget?.warningAt ? String(budget.warningAt) : '80');
    setShowForm(true);
    setTimeout(() => amountInputRef.current?.focus(), 100);
  };

  const closeForm = () => {
    setShowForm(false);
    setBudgetAmount('');
    setWarningAt('80');
  };

  const handleSave = async () => {
    if (!budgetAmount || parseFloat(budgetAmount) <= 0) {
      showErrorToast(t('common.error'), t('budget.invalidAmount'));
      return;
    }
    const warningAtNum = parseInt(warningAt) || 80;
    if (warningAtNum < 0 || warningAtNum > 100) {
      showErrorToast(t('common.error'), t('budget.invalidWarningAt'));
      return;
    }

    setSaving(true);
    try {
      const amount = parseFloat(budgetAmount);
      if (budget?.id) {
        await budgetApi.updateBudget(budget.id, {
          amount,
          warningAt: warningAtNum,
        });
      } else {
        // Chưa có budget → tạo mới
        await budgetApi.createBudget({
          categoryId: undefined,
          amount,
          month: currentMonth,
          year: currentYear,
          warningAt: warningAtNum,
        });
        showSuccessToast(t('common.success'), t('budget.createSuccess'));
      }

      closeForm();
      fetchBudget();
    } catch (error: any) {
      showErrorToast(
        t('common.error'),
        error?.error || error?.message || t('budget.saveFailed'),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAmountChange = (value: string) => {
    setBudgetAmount(value.replace(/[^0-9]/g, ''));
  };

  const budgetDisplay = budget ? getBudgetDisplayState(budget) : null;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[PRIMARY_COLOR]}
          />
        }
      >
        <View style={styles.headerRow}>
          <Text style={styles.screenTitle}>{t('budget.title')}</Text>
        </View>

        {/* Hero Card - Budget Overview */}
        <View style={styles.heroCard}>
          {budget && budget.amount ? (
            <>
              <View style={styles.tabContainer}>
                <View>
                  <Text style={styles.tabLabel}>{t('budget.spentLabel')}</Text>
                  <Text
                    style={[
                      styles.tabValueSpent,
                      budgetDisplay?.isOverBudget && styles.tabValueSpentOver,
                    ]}
                  >
                    {formatCurrency(budgetDisplay?.spent || 0)}
                  </Text>
                </View>
                <View>
                  <Text style={styles.tabLabel}>{t('budget.limitLabel')}</Text>
                  <Text style={styles.tabValueBudget}>
                    {formatCurrency(budgetDisplay?.amount || 0)}
                  </Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBarTrack}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${
                          budgetDisplay?.progressPercent ?? 0
                        }%` as `${number}%`,
                      },
                      budgetDisplay?.isOverBudget && styles.progressBarFillOver,
                    ]}
                  />
                </View>
              </View>

              {/* Remaining Amount */}
              {budgetDisplay?.isOverBudget ? (
                <Text style={[styles.remainingText, styles.overBudgetText]}>
                  {t('budget.overBudgetText', {
                    amount: formatCurrency(budgetDisplay.overflowAmount),
                  })}
                </Text>
              ) : (
                <Text style={styles.remainingText}>
                  {t('budget.remainingText', {
                    amount: formatCurrency(budgetDisplay?.remaining || 0),
                  })}
                </Text>
              )}

              {/* Update Button */}
              {!showForm && (
                <TouchableOpacity
                  style={styles.updateTargetButton}
                  onPress={openForm}
                >
                  <FontAwesome6
                    name="pen"
                    size={14}
                    color="#EC4899"
                    iconStyle="solid"
                  />
                  <Text style={styles.updateTargetButtonText}>
                    {t('budget.updateTarget')}
                  </Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <View style={styles.emptyBudgetState}>
              <FontAwesome6
                name="wallet"
                size={32}
                color="#CBD5E1"
                iconStyle="solid"
              />
              <Text style={styles.emptyBudgetTitle}>
                {t('budget.emptyTitle')}
              </Text>
              <Text style={styles.emptyBudgetDesc}>
                {t('budget.emptyDesc')}
              </Text>
              {!showForm && (
                <TouchableOpacity
                  style={styles.createBudgetButton}
                  onPress={openForm}
                >
                  <FontAwesome6
                    name="plus"
                    size={14}
                    color="#FFFFFF"
                    iconStyle="solid"
                  />
                  <Text style={styles.createBudgetButtonText}>
                    {t('budget.createBudget')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Inline Update Form */}
        {showForm && (
          <View style={styles.formCard}>
            {/* Form Header */}
            <View style={styles.formHeader}>
              <View style={styles.formHeaderLeft}>
                <View style={styles.formIconWrapper}>
                  <FontAwesome6
                    name="wallet"
                    size={16}
                    color={SECONDARY_COLOR}
                    iconStyle="solid"
                  />
                </View>
                <View>
                  <Text style={styles.formTitle}>{t('budget.formTitle')}</Text>
                  <Text style={styles.formSubtitle}>
                    {t('budget.monthYear', {
                      month: currentMonth,
                      year: currentYear,
                    })}
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={styles.formCloseBtn} onPress={closeForm}>
                <FontAwesome6
                  name="xmark"
                  size={16}
                  color="#64748B"
                  iconStyle="solid"
                />
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={styles.formDivider} />

            {/* Số tiền */}
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>{t('budget.amountLabel')}</Text>
              <View style={styles.inputContainer}>
                <FontAwesome6
                  name="money-bill-wave"
                  size={15}
                  color="#64748B"
                  iconStyle="solid"
                />
                <TextInput
                  ref={amountInputRef}
                  style={styles.input}
                  placeholder={t('budget.amountPlaceholder')}
                  keyboardType="numeric"
                  value={
                    budgetAmount
                      ? parseInt(budgetAmount).toLocaleString('vi-VN')
                      : ''
                  }
                  onChangeText={handleAmountChange}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
            {/* Action Buttons */}
            <View style={styles.formActions}>
              <TouchableOpacity
                style={[styles.formBtn, styles.cancelBtn]}
                onPress={closeForm}
              >
                <Text style={styles.cancelBtnText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.formBtn, styles.saveBtn]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveBtnText}>{t('common.save')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Settlement Summary Card */}
        {paymentSummary && (
          <View style={styles.settlementCard}>
            <View style={styles.settlementHeader}>
              <View style={styles.settlementTitleRow}>
                <FontAwesome6
                  name="hand-holding-dollar"
                  size={18}
                  color="#1E293B"
                  iconStyle="solid"
                />
                <Text style={styles.settlementTitle}>
                  {t('budget.settlementTitle')}
                </Text>
              </View>
              <Text style={styles.settlementSubtitle}>
                {t('budget.settlementSubtitle')}
              </Text>
            </View>

            <View style={styles.settlementGrid}>
              <View style={styles.settlementItem}>
                <View
                  style={[
                    styles.settlementIconWrapper,
                    { backgroundColor: '#DBEAFE' },
                  ]}
                >
                  <FontAwesome6
                    name="wallet"
                    size={16}
                    color="#2563EB"
                    iconStyle="solid"
                  />
                </View>
                <Text style={styles.settlementItemLabel}>
                  {t('budget.youPaid')}
                </Text>
                <Text style={styles.settlementItemValue}>
                  {formatCompactMoney(paymentSummary.totalSpent)}
                </Text>
              </View>

              <View style={styles.settlementItem}>
                <View
                  style={[
                    styles.settlementIconWrapper,
                    { backgroundColor: '#FEE2E2' },
                  ]}
                >
                  <FontAwesome6
                    name="arrow-up"
                    size={16}
                    color="#DC2626"
                    iconStyle="solid"
                  />
                </View>
                <Text style={styles.settlementItemLabel}>
                  {t('budget.youOweOthers')}
                </Text>
                <Text
                  style={[styles.settlementItemValue, { color: '#DC2626' }]}
                >
                  {formatCompactMoney(paymentSummary.totalDebt)}
                </Text>
              </View>

              <View style={styles.settlementItem}>
                <View
                  style={[
                    styles.settlementIconWrapper,
                    { backgroundColor: '#D1FAE5' },
                  ]}
                >
                  <FontAwesome6
                    name="arrow-down"
                    size={16}
                    color="#059669"
                    iconStyle="solid"
                  />
                </View>
                <Text style={styles.settlementItemLabel}>
                  {t('budget.othersOweYou')}
                </Text>
                <Text
                  style={[styles.settlementItemValue, { color: '#059669' }]}
                >
                  {formatCompactMoney(paymentSummary.totalReceived)}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.settlementDetailButton}
              onPress={() => navigation.navigate(SCREEN_NAME.PAYMENT_DETAIL)}
            >
              <Text style={styles.settlementDetailButtonText}>
                {t('budget.viewPaymentDetail')}
              </Text>
              <FontAwesome6
                name="chevron-right"
                size={12}
                color={PRIMARY_COLOR}
                iconStyle="solid"
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Info Card */}
        <View style={styles.infoCard}>
          <FontAwesome6
            name="lightbulb"
            size={14}
            color="#3B82F6"
            iconStyle="solid"
          />
          <Text style={styles.infoText}>
            <Text style={styles.infoTextBold}>{t('budget.tipPrefix')}</Text>
            {t('budget.tipBody')}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F4F7F4',
  },
  container: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 14,
  },
  headerRow: {
    alignItems: 'center',
    paddingTop: 6,
    paddingBottom: 4,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
  },

  // Hero card
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  tabLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 6,
    fontWeight: '500',
  },
  tabValueSpent: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F59E0B',
  },
  tabValueSpentOver: {
    color: '#DC2626',
  },
  tabValueBudget: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBarTrack: {
    width: '100%',
    height: 12,
    borderRadius: 99,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 99,
    backgroundColor: '#F59E0B',
  },
  progressBarFillOver: {
    backgroundColor: '#DC2626',
  },
  remainingText: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 16,
    fontWeight: '500',
  },
  overBudgetText: {
    color: '#DC2626',
    fontWeight: '700',
  },
  updateTargetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FDF2F8',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#FCE7F3',
  },
  updateTargetButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EC4899',
  },
  emptyBudgetState: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  emptyBudgetTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyBudgetDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  createBudgetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: SECONDARY_COLOR,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 12,
  },
  createBudgetButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Inline form card
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 16,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  formHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  formIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#E7F0E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  formSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  formCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  formSection: {
    gap: 8,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    backgroundColor: '#F9FAFB',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
  },
  formHint: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  formActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  formBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    backgroundColor: '#F1F5F9',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
  saveBtn: {
    backgroundColor: SECONDARY_COLOR,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Settlement card
  settlementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  settlementHeader: {
    marginBottom: 16,
  },
  settlementTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  settlementTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  settlementSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 28,
  },
  settlementGrid: {
    gap: 12,
    marginBottom: 16,
  },
  settlementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  settlementIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settlementItemLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
  },
  settlementItemValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  settlementDetailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: SECONDARY_COLOR,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  settlementDetailButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Info card
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#1E40AF',
    lineHeight: 18,
  },
  infoTextBold: {
    fontWeight: '700',
  },
});

export default BudgetScreen;
