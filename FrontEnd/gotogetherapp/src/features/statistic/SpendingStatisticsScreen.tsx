import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { PRIMARY_COLOR, SECONDARY_COLOR } from '../../constants/color';
import { spendingApi, SpendingStatisticsResponse } from '../spending/api';
import { useTranslation } from '../../hooks/useTranslation';
// month/year filter is now a shared component used inside TripsSummarySection
import TripsSummarySection from './components/TripsSummarySection';
import CategoriesSummarySection from './components/CategoriesSummarySection';

const currentMonth = new Date().getMonth() + 1;
const currentYear = new Date().getFullYear();
const SpendingStatisticsScreen = ({ navigation }: { navigation: any }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  
  const { t } = useTranslation();
  const [stats, setStats] = useState<SpendingStatisticsResponse>({
    totalAcrossTrips: 0,
    selectedTripId: null,
    trips: [],
    categories: [],
  });

  const [refreshKey, setRefreshKey] = useState(0);

  const safeTrips = stats.trips ?? [];
  const safeCategories = stats.categories ?? [];

  // Fetch statistics when month/year changes or refresh
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setErrorText('');
        setLoading(true);
        const response = await spendingApi.getSpendingStatistics(
          undefined,
          selectedMonth,
          selectedYear,
        );

        const trips = Array.isArray(response?.trips) ? response.trips : [];
        const filteredTrips = trips.filter(
          trip => Number(trip.totalAmount ?? 0) > 0 || Number(trip.expenseCount ?? 0) > 0,
        );
        const firstTrip = filteredTrips[0] ?? null;
        const nextTripId = firstTrip?.tripId ?? null;

        setStats({
          totalAcrossTrips: Number(response?.totalAcrossTrips ?? 0),
          selectedTripId: null,
          trips: filteredTrips,
          categories: Array.isArray(response?.categories)
            ? response.categories
            : [],
        });

        // Auto-select first trip that actually has data in this month
        if (nextTripId) {
          setSelectedTripId(nextTripId);
        } else {
          setSelectedTripId(null);
        }
      } catch (error: any) {
        setErrorText(
          error?.error || error?.message || t('statistics.loadFailed'),
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

    fetchStatistics();
  }, [selectedMonth, selectedYear, refreshKey]);

  // Fetch categories when trip selected
  useEffect(() => {
    if (!selectedTripId) {
      return;
    }

    if (!safeTrips.some(trip => trip.tripId === selectedTripId)) {
      return;
    }

    const fetchCategories = async () => {
      try {
        const response = await spendingApi.getSpendingStatistics(
          selectedTripId,
          selectedMonth,
          selectedYear,
        );

        setStats(prev => ({
          ...prev,
          categories: Array.isArray(response?.categories)
            ? response.categories
            : [],
        }));
      } catch (error: any) {
        // silently fail
      }
    };

    fetchCategories();
  }, [selectedTripId, selectedMonth, selectedYear]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setRefreshKey(prev => prev + 1);
  }, []);

  const handleMonthChange = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
    setSelectedTripId(null);
    setStats({
      totalAcrossTrips: 0,
      selectedTripId: null,
      trips: [],
      categories: [],
    });
  };

  const selectedTripName = useMemo(
    () => safeTrips.find(item => item.tripId === selectedTripId)?.tripName || '',
    [safeTrips, selectedTripId],
  );

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
        <Text style={styles.headerTitle}>{t('statistics.title')}</Text>
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
            <Text style={styles.loadingText}>{t('statistics.loading')}</Text>
          </View>
        ) : (
          <>
            <TripsSummarySection
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              trips={safeTrips}
              selectedTripId={selectedTripId}
              onSelectTrip={setSelectedTripId}
              onChangeMonthYear={handleMonthChange}
            />

            <CategoriesSummarySection
              categories={safeCategories}
              selectedTripName={selectedTripName || null}
            />

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
  errorText: {
    color: '#DC2626',
    fontSize: 13,
  },
});

export default SpendingStatisticsScreen;
