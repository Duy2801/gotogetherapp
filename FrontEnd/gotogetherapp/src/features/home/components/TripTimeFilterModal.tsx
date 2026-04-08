import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { Text } from 'react-native';
import { SECONDARY_COLOR } from '../../../constants/color';

interface MonthSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  availableYears?: number[];
}

const MonthSelector: React.FC<MonthSelectorProps> = ({
  selectedDate,
  onDateChange,
  availableYears = [],
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const months = [
    'Tháng 1',
    'Tháng 2',
    'Tháng 3',
    'Tháng 4',
    'Tháng 5',
    'Tháng 6',
    'Tháng 7',
    'Tháng 8',
    'Tháng 9',
    'Tháng 10',
    'Tháng 11',
    'Tháng 12',
  ];

  const years = Array.from(new Set(availableYears)).sort((a, b) => b - a);

  const handleMonthSelect = (monthIndex: number, year: number) => {
    const newDate = new Date(year, monthIndex, 1);
    onDateChange(newDate);
    setModalVisible(false);
  };

  const isCurrentMonth =
    selectedDate.getMonth() === currentMonth &&
    selectedDate.getFullYear() === currentYear;

  const getButtonText = () => {
    if (isCurrentMonth) {
      return `Tháng này ${selectedDate.getMonth() + 1}`;
    }
    return `Tháng ${selectedDate.getMonth() + 1}`;
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={styles.monthButton}
      >
        <Text style={styles.monthButtonText}>{getButtonText()}</Text>
        <Text style={styles.dropdownIcon}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn tháng</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {years.length === 0 ? (
                <View style={styles.emptyWrap}>
                  <Text style={styles.emptyText}>
                    Chưa có chuyến đi để chọn theo năm.
                  </Text>
                </View>
              ) : (
                years.map(year => (
                  <View key={year} style={styles.yearSection}>
                    <Text style={styles.yearText}>Năm {year}</Text>
                    <View style={styles.monthGrid}>
                      {months.map((month, index) => {
                        const isSelected =
                          selectedDate.getMonth() === index &&
                          selectedDate.getFullYear() === year;

                        return (
                          <TouchableOpacity
                            key={`${year}-${index}`}
                            style={[
                              styles.monthItem,
                              isSelected ? styles.monthItemSelected : {},
                            ]}
                            onPress={() => handleMonthSelect(index, year)}
                          >
                            <Text
                              style={[
                                styles.monthItemText,
                                isSelected ? styles.monthItemTextSelected : {},
                              ]}
                            >
                              {month}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  monthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  monthButtonText: {
    fontSize: 14,
    marginRight: 5,
    color: '#333',
    fontWeight: 'bold',
  },
  dropdownIcon: {
    fontSize: 10,
    color: '#333',
  },
  closeIcon: {
    fontSize: 20,
    color: '#666',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  yearSection: {
    marginTop: 20,
  },
  yearText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  monthItem: {
    width: '30%',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  monthItemSelected: {
    backgroundColor: SECONDARY_COLOR,
  },
  monthItemText: {
    fontSize: 14,
    color: '#333',
  },
  monthItemTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyWrap: {
    paddingVertical: 28,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default MonthSelector;
