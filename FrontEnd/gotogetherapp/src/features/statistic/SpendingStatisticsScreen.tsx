import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { PRIMARY_COLOR, SECONDARY_COLOR } from '../../constants/color';
import { spendingApi, SpendingStatisticsResponse } from '../spending/api';
import { formatCompactMoney, formatMoney } from '../../utils/format';

const currentMonth = new Date().getMonth() + 1;
const currentYear = new Date().getFullYear();

const SpendingStatisticsScreen = ({ navigation }: { navigation: any }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [stats, setStats] = useState<SpendingStatisticsResponse>({
    totalAcrossTrips: 0,
    selectedTripId: null,
    trips: [],
    categories: [],
  });

  const safeTrips = stats.trips ?? [];
  const safeCategories = stats.categories ?? [];

  const fetchStatistics = useCallback(async (tripId?: string) => {
    try {
      setErrorText('');
      const response = await spendingApi.getSpendingStatistics(
        tripId,
        currentMonth,
        currentYear,
      );
      setStats({
        totalAcrossTrips: Number(response?.totalAcrossTrips ?? 0),
        selectedTripId: response?.selectedTripId ?? null,
        trips: Array.isArray(response?.trips) ? response.trips : [],
        categories: Array.isArray(response?.categories)
          ? response.categories
          : [],
      });

      setSelectedTripId(
        tripId ||
          response?.selectedTripId ||
          response?.trips?.[0]?.tripId ||
          null,
      );
    } catch (error: any) {
      setErrorText(error?.error || error?.message || 'Không thể tải thống kê');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  useEffect(() => {
    if (!selectedTripId) {
      return;
    }
    fetchStatistics(selectedTripId);
  }, [selectedTripId, fetchStatistics]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStatistics(selectedTripId || undefined);
  }, [fetchStatistics, selectedTripId]);

  const selectedTrip = useMemo(
    () => safeTrips.find(item => item.tripId === selectedTripId),
    [safeTrips, selectedTripId],
  );

  const chartMaxAmount = useMemo(
    () => Math.max(...safeTrips.map(item => Number(item.totalAmount ?? 0)), 0),
    [safeTrips],
  );

  const chartTicks = useMemo(() => {
    if (!chartMaxAmount) {
      return [0, 0, 0, 0, 0];
    }

    return [1, 0.75, 0.5, 0.25, 0].map(ratio => chartMaxAmount * ratio);
  }, [chartMaxAmount]);

  const renderCategoryIcon = (item: (typeof safeCategories)[number]) => {
    const iconValue = item.icon || '';
    const isRemoteImage =
      /^https?:\/\//i.test(iconValue) ||
      iconValue.startsWith('file:') ||
      iconValue.startsWith('data:');

    if (isRemoteImage) {
      return (
        <Image source={{ uri: iconValue }} style={styles.categoryImageIcon} />
      );
    }

    return (
      <FontAwesome6
        name={(iconValue || 'wallet') as any}
        size={13}
        color={item.color || '#4F46E5'}
        iconStyle="solid"
      />
    );
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <FontAwesome6
            name="chevron-left"
            size={18}
            color="#111827"
            iconStyle="solid"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thống kê chi tiêu</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

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
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={PRIMARY_COLOR} />
            <Text style={styles.loadingText}>Đang tải thống kê...</Text>
          </View>
        ) : (
          <>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>
                Theo chuyến đi trong tháng
              </Text>
              <Text style={styles.sectionSubTitle}>
                {stats.monthLabel || `${currentMonth}/${currentYear}`}
              </Text>
            </View>

            {safeTrips.length ? (
              <View style={styles.chartCard}>
                <View style={styles.chartTopRow}>
                  <View>
                    <Text style={styles.chartTitle}>
                      Biểu đồ thanh chi tiêu
                    </Text>
                    <Text style={styles.chartSubtitle}>
                      Chạm vào từng chuyến đi để xem danh mục chi tiêu
                    </Text>
                  </View>
                  <View style={styles.chartLegend}>
                    <View style={styles.legendDot} />
                    <Text style={styles.legendText}>Số tiền</Text>
                  </View>
                </View>

                <View style={styles.chartBody}>
                  <View style={styles.chartYAxis}>
                    {chartTicks.map((value, index) => (
                      <Text key={index} style={styles.chartYAxisLabel}>
                        {formatCompactMoney(value)}
                      </Text>
                    ))}
                  </View>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.chartScrollContent}
                  >
                    <View
                      style={[
                        styles.chartPlotArea,
                        {
                          width: Math.max(safeTrips.length * 84, 280),
                        },
                      ]}
                    >
                      <View style={styles.chartGrid}>
                        {chartTicks.slice(1, 4).map((value, index) => (
                          <View key={index} style={styles.chartGridLine} />
                        ))}
                      </View>

                      <View style={styles.chartColumnsRow}>
                        {safeTrips.map(trip => {
                          const isActive = trip.tripId === selectedTripId;
                          const barHeight = chartMaxAmount
                            ? Math.max(
                                10,
                                (Number(trip.totalAmount ?? 0) /
                                  chartMaxAmount) *
                                  148,
                              )
                            : 10;

                          return (
                            <TouchableOpacity
                              key={trip.tripId}
                              style={styles.chartColumn}
                              activeOpacity={0.8}
                              onPress={() => setSelectedTripId(trip.tripId)}
                            >
                              <View style={styles.chartBarWrap}>
                                <View style={styles.chartBarTrack}>
                                  <View
                                    style={[
                                      styles.chartBarFill,
                                      { height: barHeight },
                                      isActive && styles.chartBarFillActive,
                                    ]}
                                  />
                                </View>
                                <Text
                                  style={styles.chartValueText}
                                  numberOfLines={1}
                                >
                                  {formatCompactMoney(trip.totalAmount)}
                                </Text>
                              </View>
                              <Text
                                style={[
                                  styles.chartTripLabel,
                                  isActive && styles.chartTripLabelActive,
                                ]}
                                numberOfLines={2}
                              >
                                {trip.tripName}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  </ScrollView>
                </View>
              </View>
            ) : (
              <View style={styles.emptyCard}>
                <FontAwesome6
                  name="chart-column"
                  size={24}
                  color="#D1D5DB"
                  iconStyle="solid"
                />
                <Text style={styles.emptyText}>
                  Tháng này chưa có chuyến đi nào có chi tiêu.
                </Text>
              </View>
            )}

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Danh mục đã chi</Text>
              {!!selectedTrip && (
                <Text style={styles.selectedTripText} numberOfLines={1}>
                  {selectedTrip.tripName}
                </Text>
              )}
            </View>

            {safeCategories.length ? (
              <View style={styles.categoryList}>
                {safeCategories.map(item => (
                  <View key={item.categoryId} style={styles.categoryRow}>
                    <View
                      style={[
                        styles.categoryIconWrap,
                        {
                          backgroundColor:
                            item.color && item.color.startsWith('#')
                              ? `${item.color}22`
                              : '#EEF2FF',
                        },
                      ]}
                    >
                      {renderCategoryIcon(item)}
                    </View>
                    <View style={styles.categoryMeta}>
                      <Text style={styles.categoryName}>
                        {item.categoryName}
                      </Text>
                      <Text style={styles.categorySubText}>
                        {item.expenseCount} khoản • {item.percentage}%
                      </Text>
                    </View>
                    <Text style={styles.categoryAmount}>
                      {formatMoney(item.totalAmount)}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyCard}>
                <FontAwesome6
                  name="chart-pie"
                  size={24}
                  color="#D1D5DB"
                  iconStyle="solid"
                />
                <Text style={styles.emptyText}>
                  Chưa có dữ liệu danh mục cho chuyến đi này.
                </Text>
              </View>
            )}

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
    backgroundColor: '#F9FAFB',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  headerRightPlaceholder: {
    width: 40,
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
    gap: 12,
  },
  loadingWrap: {
    minHeight: 260,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: '#6B7280',
    fontSize: 14,
  },
  summaryCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
  },
  summaryLabel: {
    color: '#94A3B8',
    fontSize: 13,
    marginBottom: 6,
  },
  summaryValue: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 6,
  },
  summarySubText: {
    color: '#CBD5E1',
    fontSize: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  sectionSubTitle: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    gap: 12,
  },
  chartTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  chartSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: '#6B7280',
  },
  chartLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: PRIMARY_COLOR,
  },
  legendText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
  },
  chartBody: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  chartYAxis: {
    width: 56,
    height: 210,
    justifyContent: 'space-between',
    paddingTop: 6,
    paddingBottom: 24,
  },
  chartYAxisLabel: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'right',
  },
  chartScrollContent: {
    paddingRight: 8,
  },
  chartPlotArea: {
    height: 210,
    paddingTop: 6,
    paddingBottom: 0,
  },
  chartGrid: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingBottom: 34,
  },
  chartGridLine: {
    height: 1,
    backgroundColor: '#EEF2F7',
  },
  chartColumnsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingBottom: 6,
  },
  chartColumn: {
    width: 74,
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 4,
  },
  chartBarWrap: {
    width: '100%',
    height: 150,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  chartBarTrack: {
    width: 40,
    height: 148,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  chartBarFill: {
    width: '100%',
    borderRadius: 10,
    backgroundColor: '#93C5FD',
  },
  chartBarFillActive: {
    backgroundColor: SECONDARY_COLOR,
  },
  chartValueText: {
    marginTop: 8,
    fontSize: 11,
    color: '#111827',
    fontWeight: '700',
  },
  chartTripLabel: {
    width: '100%',
    minHeight: 24,
    fontSize: 11,
    color: '#334155',
    textAlign: 'center',
    fontWeight: '600',
  },
  chartTripLabelActive: {
    color: PRIMARY_COLOR,
  },
  selectedTripText: {
    flex: 1,
    textAlign: 'right',
    color: '#6B7280',
    fontSize: 12,
  },
  tripListContent: {
    gap: 10,
    paddingRight: 16,
  },
  tripCard: {
    width: 168,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    gap: 5,
  },
  tripCardActive: {
    borderColor: '#111827',
    backgroundColor: '#F8FAFC',
  },
  tripName: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '700',
  },
  tripNameActive: {
    color: '#111827',
  },
  tripAmount: {
    fontSize: 20,
    color: '#111827',
    fontWeight: '700',
  },
  tripAmountActive: {
    color: PRIMARY_COLOR,
  },
  tripExpenseCount: {
    fontSize: 12,
    color: '#6B7280',
  },
  tripExpenseCountActive: {
    color: '#374151',
  },
  categoryList: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  categoryIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  categoryImageIcon: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  categoryMeta: {
    flex: 1,
  },
  categoryName: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  categorySubText: {
    marginTop: 2,
    fontSize: 12,
    color: '#6B7280',
  },
  categoryAmount: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
  },
});

export default SpendingStatisticsScreen;
