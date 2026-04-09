import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { useNavigation } from '@react-navigation/native';
import { PRIMARY_COLOR, SECONDARY_COLOR } from '../../../constants/color';
import { tripApi, Trip } from '../../home/api';
import { tripDetailApi, Expense } from '../../tripdetail/api';
import { showErrorToast } from '../../../utils/appToast';
import { useTranslation } from '../../../hooks/useTranslation';

const HistoryScreen = () => {
  const navigation = useNavigation<any>();
  const { t, locale } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [tripExpensesMap, setTripExpensesMap] = useState<
    Map<string, Expense[]>
  >(new Map());
  const [expandedTripId, setExpandedTripId] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const tripResponse = await tripApi.getTrips({
        status: 'COMPLETED',
        page: 1,
        limit: 50,
      });

      if (tripResponse.status) {
        const completedTrips = tripResponse.data.trips || [];
        setTrips(completedTrips);

        // Fetch expenses for each trip
        const expensesMap = new Map<string, Expense[]>();
        for (const trip of completedTrips) {
          try {
            const expenseResponse = await tripDetailApi.getTripExpenses(
              trip.id,
              { page: 1, limit: 100 },
            );
            if (
              expenseResponse.status &&
              expenseResponse.data?.expenses?.length > 0
            ) {
              expensesMap.set(trip.id, expenseResponse.data.expenses);
            }
          } catch (error) {
            console.log(`Failed to fetch expenses for trip ${trip.id}:`, error);
          }
        }
        setTripExpensesMap(expensesMap);
      }
    } catch (error: any) {
      showErrorToast(
        t('common.error'),
        error?.error || t('history.loadFailed'),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString(
      locale === 'en' ? 'en-US' : 'vi-VN',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      },
    );

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

        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>{t('history.title')}</Text>
          <Text style={styles.heroSubtitle}>
            {t('history.expenseHistorySubtitle')}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('history.expenseHistory')}</Text>
          {loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="small" color={SECONDARY_COLOR} />
            </View>
          ) : trips.length ? (
            trips.map(trip => (
              <View key={trip.id} style={styles.tripSection}>
                <TouchableOpacity
                  style={styles.tripHeader}
                  onPress={() =>
                    setExpandedTripId(
                      expandedTripId === trip.id ? null : trip.id,
                    )
                  }
                >
                  {trip.images ? (
                    <Image
                      source={{ uri: trip.images }}
                      style={styles.tripThumbnail}
                    />
                  ) : (
                    <View style={styles.tripThumbnailPlaceholder}>
                      <FontAwesome6
                        name="image"
                        size={16}
                        color="#9CA3AF"
                        iconStyle="solid"
                      />
                    </View>
                  )}
                  <View style={styles.tripInfo}>
                    <Text style={styles.tripName} numberOfLines={1}>
                      {trip.name}
                    </Text>
                    <Text style={styles.tripDates}>
                      {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                    </Text>
                  </View>
                  <FontAwesome6
                    name={
                      expandedTripId === trip.id ? 'chevron-up' : 'chevron-down'
                    }
                    size={12}
                    color="#6B7280"
                    iconStyle="solid"
                  />
                </TouchableOpacity>

                {expandedTripId === trip.id && tripExpensesMap.has(trip.id) && (
                  <View style={styles.expensesContainer}>
                    {tripExpensesMap.get(trip.id)?.map((expense, index) => (
                      <View
                        key={expense.id}
                        style={[
                          styles.expenseItem,
                          index ===
                            (tripExpensesMap.get(trip.id)?.length || 0) - 1 &&
                            styles.expenseItemLast,
                        ]}
                      >
                        <View style={styles.expenseCategoryIcon}>
                          <FontAwesome6
                            name="receipt"
                            size={14}
                            color="#EC4899"
                            iconStyle="solid"
                          />
                        </View>
                        <View style={styles.expenseContent}>
                          <Text
                            style={styles.expenseDescription}
                            numberOfLines={1}
                          >
                            {expense.description ||
                              expense.category?.name ||
                              'Chi tiêu'}
                          </Text>
                          <Text style={styles.expenseDetail}>
                            {t('history.paidBy')}{' '}
                            <Text style={styles.expenseDetailBold}>
                              {expense.paidBy?.fullName}
                            </Text>
                            {' • '}
                            {formatDate(expense.date)}
                          </Text>
                        </View>
                        <View style={styles.expenseAmountWrap}>
                          <Text style={styles.expenseAmount}>
                            {Number(expense.amount).toLocaleString(
                              locale === 'en' ? 'en-US' : 'vi-VN',
                            )}
                          </Text>
                          <Text style={styles.expenseCurrency}>
                            {expense.currency || 'VNĐ'}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>
              {t('history.noCompletedTrips')}
            </Text>
          )}
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
  heroCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  heroSubtitle: {
    marginTop: 6,
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#14532D',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  loadingWrap: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 12,
  },
  tripImage: {
    width: 96,
    height: 96,
  },
  tripPlaceholder: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2EE',
  },
  tripPlaceholderText: {
    color: '#6B7280',
    fontSize: 12,
    textAlign: 'center',
  },
  cardBody: {
    flex: 1,
    padding: 14,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  cardMeta: {
    marginTop: 6,
    color: '#6B7280',
    fontSize: 12,
  },
  cardStatus: {
    marginTop: 8,
    color: '#16A34A',
    fontSize: 12,
    fontWeight: '700',
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
  },
  historyDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: SECONDARY_COLOR,
    marginTop: 5,
  },
  historyContent: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  historySubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 17,
  },
  historyDate: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 6,
  },
  tripSection: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
  },
  tripHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
  },
  tripThumbnail: {
    width: 64,
    height: 64,
    borderRadius: 12,
  },
  tripThumbnailPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#EEF2EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tripInfo: {
    flex: 1,
  },
  tripName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  tripDates: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  expensesContainer: {
    borderTopWidth: 1,
    borderTopColor: '#EEF2EE',
    padding: 12,
  },
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2EE',
  },
  expenseItemLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  expenseCategoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FCE7F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  expenseContent: {
    flex: 1,
  },
  expenseDescription: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  expenseDetail: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
  },
  expenseDetailBold: {
    fontWeight: '700',
    color: '#4B5563',
  },
  expenseAmountWrap: {
    alignItems: 'flex-end',
  },
  expenseAmount: {
    fontSize: 13,
    fontWeight: '800',
    color: '#EC4899',
  },
  expenseCurrency: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 13,
    paddingHorizontal: 4,
  },
});

export default HistoryScreen;
