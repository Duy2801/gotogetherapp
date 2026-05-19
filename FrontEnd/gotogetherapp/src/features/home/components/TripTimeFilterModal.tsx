import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Text } from 'react-native';
import { SECONDARY_COLOR } from '../../../constants/color';

interface MonthSelectorProps {
  selectedMonth: number;
  onMonthChange: (month: number) => void;
}

const MonthSelector: React.FC<MonthSelectorProps> = ({
  selectedMonth,
  onMonthChange,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const currentMonth = new Date().getMonth();

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const handleMonthSelect = (monthIndex: number) => {
    onMonthChange(monthIndex);
    setModalVisible(false);
  };

  const buttonText =
    selectedMonth === currentMonth
      ? `Tháng này • ${months[selectedMonth]}`
      : months[selectedMonth];

  return (
    <>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={styles.monthButton}
      >
        <Text style={styles.monthButtonText}>{buttonText}</Text>
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
              <Text style={styles.modalTitle}>Select month</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.monthGrid}>
              {months.map((month, index) => {
                const isSelected = selectedMonth === index;

                return (
                  <TouchableOpacity
                    key={month}
                    style={[
                      styles.monthItem,
                      isSelected ? styles.monthItemSelected : {},
                    ]}
                    onPress={() => handleMonthSelect(index)}
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
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingVertical: 8,
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
});

export default MonthSelector;
