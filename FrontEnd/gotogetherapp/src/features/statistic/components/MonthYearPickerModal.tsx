import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { SECONDARY_COLOR } from '../../../constants/color';
import { useTranslation } from '../../../hooks/useTranslation';

const monthNames = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

type Props = {
  visible: boolean;
  pickerYear: number;
  selectedMonth: number;
  selectedYear: number;
  onClose: () => void;
  onChangeYear: (delta: number) => void;
  onSelectMonth: (month: number, year: number) => void;
};

const MonthYearPickerModal = ({
  visible,
  pickerYear,
  selectedMonth,
  selectedYear,
  onClose,
  onChangeYear,
  onSelectMonth,
}: Props) => {
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.monthPickerModal}>
          <View style={styles.monthPickerHeader}>
            <TouchableOpacity
              onPress={() => onChangeYear(-1)}
              style={styles.yearNavButton}
            >
              <FontAwesome6
                name="chevron-left"
                size={14}
                color="#0F172A"
                iconStyle="solid"
              />
            </TouchableOpacity>

            <Text style={styles.monthPickerYear}>{pickerYear}</Text>

            <TouchableOpacity
              onPress={() => onChangeYear(1)}
              style={styles.yearNavButton}
            >
              <FontAwesome6
                name="chevron-right"
                size={14}
                color="#0F172A"
                iconStyle="solid"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.monthGrid}>
            {monthNames.map((label, index) => {
              const month = index + 1;
              const isSelected =
                month === selectedMonth && pickerYear === selectedYear;

              return (
                <TouchableOpacity
                  key={label}
                  style={[
                    styles.monthGridItem,
                    isSelected && styles.monthGridItemSelected,
                  ]}
                  onPress={() => onSelectMonth(month, pickerYear)}
                >
                  <Text
                    style={[
                      styles.monthGridItemText,
                      isSelected && styles.monthGridItemTextSelected,
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.monthPickerFooter}>
            {new Date(pickerYear, selectedMonth - 1, 1).toLocaleDateString(
              'en-US',
              {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              },
            )}
          </Text>

          <Text style={styles.monthPickerHint}>{t('statistics.selectMonth')}</Text>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  monthPickerModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    width: '100%',
    maxWidth: 360,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  monthPickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  yearNavButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthPickerYear: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  monthGridItem: {
    width: '23%',
    minHeight: 48,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthGridItemSelected: {
    borderColor: SECONDARY_COLOR,
    backgroundColor: `${SECONDARY_COLOR}10`,
  },
  monthGridItemText: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '600',
  },
  monthGridItemTextSelected: {
    color: SECONDARY_COLOR,
    fontWeight: '700',
  },
  monthPickerFooter: {
    textAlign: 'center',
    marginTop: 4,
    fontSize: 12,
    color: '#475569',
  },
  monthPickerHint: {
    textAlign: 'center',
    marginTop: 4,
    fontSize: 11,
    color: '#94A3B8',
  },
});

export default MonthYearPickerModal;