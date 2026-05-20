import React, { useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { PRIMARY_COLOR, SECONDARY_COLOR } from '../../../constants/color';
import { formatCompactMoney } from '../../../utils/format';
import { SpendingStatisticsTrip } from '../../spending/api';
import { useTranslation } from '../../../hooks/useTranslation';

type Props = {
  selectedMonth: number;
  selectedYear: number;
  trips: SpendingStatisticsTrip[];
  selectedTripId: string | null;
  onSelectTrip: (tripId: string) => void;
  onOpenMonthPicker: () => void;
};

const TripsSummarySection = ({
  selectedMonth,
  selectedYear,
  trips,
  selectedTripId,
  onSelectTrip,
  onOpenMonthPicker,
}: Props) => {
  const { t } = useTranslation();

  const chartMaxAmount = useMemo(
    () => Math.max(...trips.map(item => Number(item.totalAmount ?? 0)), 0),
    [trips],
  );

  const chartTicks = useMemo(() => {
    if (!chartMaxAmount) {
      return [0, 0, 0, 0, 0];
    }

    return [1, 0.75, 0.5, 0.25, 0].map(ratio => chartMaxAmount * ratio);
  }, [chartMaxAmount]);

  return (
    <>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>{t('statistics.monthlyTrips')}</Text>
        <TouchableOpacity
          style={styles.monthFilterButton}
          onPress={onOpenMonthPicker}
        >
          <FontAwesome6
            name="calendar"
            size={14}
            color={SECONDARY_COLOR}
            iconStyle="solid"
          />
          <Text style={styles.monthFilterText}>
            {selectedMonth}/{selectedYear}
          </Text>
        </TouchableOpacity>
      </View>

      {trips.length ? (
        <View style={styles.chartCard}>
          <View style={styles.chartTopRow}>
            <View>
              <Text style={styles.chartTitle}>{t('statistics.barChart')}</Text>
              <Text style={styles.chartSubtitle}>
                {t('statistics.barChartDesc')}
              </Text>
            </View>
            <View style={styles.chartLegend}>
              <View style={styles.legendDot} />
              <Text style={styles.legendText}>{t('statistics.amount')}</Text>
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
                    width: Math.max(trips.length * 84, 280),
                  },
                ]}
              >
                <View style={styles.chartGrid}>
                  {chartTicks.slice(1, 4).map((value, index) => (
                    <View key={index} style={styles.chartGridLine} />
                  ))}
                </View>

                <View style={styles.chartColumnsRow}>
                  {trips.map(trip => {
                    const isActive = trip.tripId === selectedTripId;
                    const barHeight = chartMaxAmount
                      ? Math.max(
                          10,
                          (Number(trip.totalAmount ?? 0) / chartMaxAmount) * 148,
                        )
                      : 10;

                    return (
                      <TouchableOpacity
                        key={trip.tripId}
                        style={styles.chartColumn}
                        activeOpacity={0.8}
                        onPress={() => onSelectTrip(trip.tripId)}
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
                          <Text style={styles.chartValueText} numberOfLines={1}>
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
          <Text style={styles.emptyText}>{t('statistics.noTrips')}</Text>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
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
  monthFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: `${SECONDARY_COLOR}10`,
    borderWidth: 1,
    borderColor: `${SECONDARY_COLOR}40`,
  },
  monthFilterText: {
    fontSize: 13,
    fontWeight: '600',
    color: SECONDARY_COLOR,
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
});

export default TripsSummarySection;