import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { PRIMARY_COLOR, SECONDARY_COLOR } from '../../../constants/color';

export type FilterType = 'all' | 'debt' | 'receivable';

interface PaymentFilterProps {
  filterType: FilterType;
  setFilterType: (type: FilterType) => void;
  allTrips: { id: string; name: string }[];
  selectedTripId: string | null;
  setSelectedTripId: (id: string | null) => void;
  loading: boolean;
}

export const PaymentFilter: React.FC<PaymentFilterProps> = ({
  filterType,
  setFilterType,
  allTrips,
  selectedTripId,
  setSelectedTripId,
  loading,
}) => {
  return (
    <View style={styles.container}>
      {/* Filter Type Tabs */}
      <View style={styles.filterTabBar}>
        {(
          [
            { key: 'all', label: 'Tất cả' },
            { key: 'debt', label: 'Bạn nợ' },
            { key: 'receivable', label: 'Nhận tiền' },
          ] as { key: FilterType; label: string }[]
        ).map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.filterTab,
              filterType === tab.key && styles.filterTabActive,
              filterType === tab.key &&
                tab.key === 'debt' &&
                styles.filterTabDebtActive,
              filterType === tab.key &&
                tab.key === 'receivable' &&
                styles.filterTabReceiveActive,
            ]}
            onPress={() => setFilterType(tab.key)}
          >
            <Text
              style={[
                styles.filterTabText,
                filterType === tab.key && styles.filterTabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
  },
  filterTabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  filterTabActive: {
    backgroundColor: SECONDARY_COLOR,
  },
  filterTabDebtActive: {
    backgroundColor: SECONDARY_COLOR,
    borderWidth: 1.5,
    borderColor: SECONDARY_COLOR,
  },
  filterTabReceiveActive: {
    backgroundColor: SECONDARY_COLOR,
    borderWidth: 1.5,
    borderColor: SECONDARY_COLOR,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterTabTextActive: {
    color: '#111827',
  },
  tripFilterScroll: {
    maxHeight: 52,
  },
  tripFilterContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    flexDirection: 'row',
  },
  tripFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tripFilterChipActive: {
    backgroundColor: SECONDARY_COLOR,
    borderColor: PRIMARY_COLOR,
  },
  tripFilterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    maxWidth: 120,
  },
  tripFilterChipTextActive: {
    color: '#FFFFFF',
  },
});
