import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { PRIMARY_COLOR } from '../../constants/color';
import { SCREEN_NAME } from '../../constants/screenName';
import { spendingApi } from './api';
import { formatCurrency, formatCompactMoney } from '../../utils/format';
import { useTranslation } from '../../hooks/useTranslation';

type SpendingOverview = {
  quantity: number;
  totalBudget: number;
  totalSpent: number;
  totalDebt: number;
  totalReceived: number;
};

const SpendingScreen = ({ navigation }: { navigation: any }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorText, setErrorText] = useState('');
  const { t } = useTranslation();
  const [overview, setOverview] = useState<SpendingOverview>({
    quantity: 0,
    totalBudget: 0,
    totalSpent: 0,
    totalDebt: 0,
    totalReceived: 0,
  });

  const fetchOverview = useCallback(async () => {
    try {
      setErrorText('');
      const [paymentSummary, budgetSummary] = await Promise.all([
        spendingApi.getPaymentSummary(),
        spendingApi.getBudgetSummary(),
      ]);

      setOverview({
        quantity: budgetSummary.quantity,
        totalBudget: budgetSummary.totalBudget,
        totalSpent: paymentSummary.totalSpent,
        totalDebt: paymentSummary.totalDebt,
        totalReceived: paymentSummary.totalReceived,
      });
    } catch (error: any) {
      setErrorText(error?.error || error?.message || t('spending.loadFailed'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOverview();
  }, [fetchOverview]);

  const remainingBudget = useMemo(
    () => Math.max(overview.totalBudget - overview.totalSpent, 0),
    [overview.totalBudget, overview.totalSpent],
  );

  const spentPercent = useMemo(() => {
    if (!overview.totalBudget) {
      return 0;
    }

    return Math.min(
      Math.round((overview.totalSpent / overview.totalBudget) * 100),
      100,
    );
  }, [overview.totalBudget, overview.totalSpent]);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[PRIMARY_COLOR]}
          />
        }
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerEyebrow}>
              {t('spending.overviewTitle')}
            </Text>
            <Text style={styles.headerTitle}>{t('spending.title')}</Text>
          </View>
          <View style={styles.tripCountPill}>
            <FontAwesome6
              name="suitcase-rolling"
              size={12}
              color="#0F172A"
              iconStyle="solid"
            />
            <Text style={styles.tripCountText}>
              {overview.quantity} {t('trip.title')}
            </Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={PRIMARY_COLOR} />
            <Text style={styles.loadingText}>{t('spending.loading')}</Text>
          </View>
        ) : (
          <>
            <View style={styles.heroCard}>
              <Text style={styles.heroLabel}>
                {t('spending.remainingBudget')}
              </Text>
              <Text style={styles.heroValue}>
                {formatCurrency(remainingBudget)}
              </Text>

              <View style={styles.progressMetaRow}>
                <Text style={styles.progressMetaText}>
                  {t('spending.usedPercent', { percent: String(spentPercent) })}
                </Text>
                <Text style={styles.progressMetaText}>
                  {t('spending.totalFund')}{' '}
                  {formatCompactMoney(overview.totalBudget)}
                </Text>
              </View>

              <View style={styles.progressTrack}>
                <View
                  style={[styles.progressFill, { width: `${spentPercent}%` }]}
                />
              </View>

              <View style={styles.statGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>{t('spending.spent')}</Text>
                  <Text style={styles.statValue}>
                    {formatCompactMoney(overview.totalSpent)}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>{t('spending.youOwe')}</Text>
                  <Text style={styles.statDebt}>
                    {formatCompactMoney(overview.totalDebt)}
                  </Text>
                </View>
                <View style={[styles.statItem, styles.statItemLast]}>
                  <Text style={styles.statLabel}>
                    {t('spending.othersOweYou')}
                  </Text>
                  <Text style={styles.statReceive}>
                    {formatCompactMoney(overview.totalReceived)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.paymentCard}>
              <View style={styles.paymentHeader}>
                <Text style={styles.cardTitle}>
                  {t('spending.paymentTitle')}
                </Text>
                <TouchableOpacity
                  style={styles.detailButton}
                  onPress={() =>
                    navigation.navigate(SCREEN_NAME.PAYMENT_DETAIL)
                  }
                >
                  <Text style={styles.detailButtonText}>
                    {t('spending.viewDetail')}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.summaryRow, styles.summaryDebtBg]}>
                <View style={styles.summaryIconWrap}>
                  <FontAwesome6
                    name="arrow-trend-down"
                    size={12}
                    color="#EF4444"
                    iconStyle="solid"
                  />
                </View>
                <View style={styles.summaryTextWrap}>
                  <Text style={styles.summaryLabel}>
                    {t('spending.debtLabel')}
                  </Text>
                  <Text style={styles.summarySubText}>
                    {t('spending.debtDesc')}
                  </Text>
                </View>
                <Text style={styles.summaryDebtValue}>
                  -{formatCompactMoney(overview.totalDebt)}
                </Text>
              </View>

              <View style={[styles.summaryRow, styles.summaryReceiveBg]}>
                <View style={styles.summaryIconWrap}>
                  <FontAwesome6
                    name="arrow-trend-up"
                    size={12}
                    color="#22C55E"
                    iconStyle="solid"
                  />
                </View>
                <View style={styles.summaryTextWrap}>
                  <Text style={styles.summaryLabel}>
                    {t('spending.receiveLabel')}
                  </Text>
                  <Text style={styles.summarySubText}>
                    {t('spending.receiveDesc')}
                  </Text>
                </View>
                <Text style={styles.summaryReceiveValue}>
                  +{formatCompactMoney(overview.totalReceived)}
                </Text>
              </View>
            </View>

            {!!errorText && <Text style={styles.errorText}>{errorText}</Text>}
          </>
        )}
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
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: 6,
  },
  headerEyebrow: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 3,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
  },
  tripCountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E7F0E8',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  tripCountText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '700',
  },
  loadingContainer: {
    minHeight: 260,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    color: '#6B7280',
    fontSize: 14,
  },
  heroCard: {
    backgroundColor: '#0D1B3A',
    borderRadius: 20,
    padding: 16,
  },
  heroLabel: {
    color: '#9CB0D9',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  heroValue: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
  },
  progressMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressMetaText: {
    color: '#C5D1EA',
    fontSize: 12,
  },
  progressTrack: {
    width: '100%',
    height: 10,
    borderRadius: 99,
    backgroundColor: '#20314F',
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1FE05A',
    borderRadius: 99,
  },
  statGrid: {
    flexDirection: 'row',
  },
  statItem: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#1E315E',
    paddingRight: 8,
  },
  statItemLast: {
    borderRightWidth: 0,
    paddingRight: 0,
    paddingLeft: 8,
  },
  statLabel: {
    color: '#7D8FB6',
    fontSize: 11,
    marginBottom: 3,
  },
  statValue: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
  },
  statDebt: {
    color: '#FB7185',
    fontSize: 18,
    fontWeight: '700',
  },
  statReceive: {
    color: '#4ADE80',
    fontSize: 18,
    fontWeight: '700',
  },
  paymentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 10,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  detailButton: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: '#EAFBF0',
  },
  detailButtonText: {
    fontSize: 12,
    color: '#159947',
    fontWeight: '700',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  summaryDebtBg: {
    backgroundColor: '#FFF1F2',
  },
  summaryReceiveBg: {
    backgroundColor: '#EDFCF2',
  },
  summaryIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  summaryTextWrap: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  summarySubText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  summaryDebtValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F43F5E',
  },
  summaryReceiveValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#22C55E',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
  },
});

export default SpendingScreen;
