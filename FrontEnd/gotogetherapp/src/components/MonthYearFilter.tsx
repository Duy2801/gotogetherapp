import React, {useState} from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { SECONDARY_COLOR } from '../constants/color';
import { useTranslation } from '../hooks/useTranslation';

const monthNames = [
  'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec',
];

type Props = {
  month: number;
  year: number;
  onChange: (month: number, year: number) => void;
  buttonStyle?: any;
  textStyle?: any;
  renderButton?: (open: () => void) => React.ReactNode;
};

const MonthYearFilter = ({ month, year, onChange, buttonStyle, textStyle, renderButton }: Props) => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [pickerYear, setPickerYear] = useState(year);

  const open = () => {
    setPickerYear(year);
    setVisible(true);
  };

  const close = () => setVisible(false);

  const changeYear = (delta: number) => setPickerYear(prev => prev + delta);

  const selectMonth = (m: number) => {
    onChange(m, pickerYear);
    setVisible(false);
  };

  return (
    <>
      {renderButton ? (
        renderButton(open)
      ) : (
        <TouchableOpacity style={[styles.button, buttonStyle]} onPress={open}>
          <FontAwesome6 name="calendar" size={14} color={SECONDARY_COLOR} iconStyle="solid" />
          <Text style={[styles.text, textStyle]}>{`${month}/${year}`}</Text>
        </TouchableOpacity>
      )}

      <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={close}>
          <View style={styles.modalCard}>
            <View style={styles.headerRow}>
              <TouchableOpacity onPress={() => changeYear(-1)} style={styles.yearNav}>
                <FontAwesome6 name="chevron-left" size={14} color="#0F172A" iconStyle="solid" />
              </TouchableOpacity>

              <Text style={styles.yearText}>{pickerYear}</Text>

              <TouchableOpacity onPress={() => changeYear(1)} style={styles.yearNav}>
                <FontAwesome6 name="chevron-right" size={14} color="#0F172A" iconStyle="solid" />
              </TouchableOpacity>
            </View>

            <View style={styles.grid}>
              {monthNames.map((label, idx) => {
                const m = idx + 1;
                const selected = m === month && pickerYear === year;
                return (
                  <TouchableOpacity
                    key={label}
                    style={[styles.gridItem, selected && styles.gridItemSelected]}
                    onPress={() => selectMonth(m)}
                  >
                    <Text style={[styles.gridText, selected && styles.gridTextSelected]}>{label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.hint}>{t('statistics.selectMonth')}</Text>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
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
  text: {
    fontSize: 13,
    fontWeight: '600',
    color: SECONDARY_COLOR,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    width: '100%',
    maxWidth: 360,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  yearNav: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearText: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  gridItem: {
    width: '23%',
    minHeight: 48,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridItemSelected: { borderColor: SECONDARY_COLOR, backgroundColor: `${SECONDARY_COLOR}10` },
  gridText: { fontSize: 14, color: '#334155', fontWeight: '600' },
  gridTextSelected: { color: SECONDARY_COLOR, fontWeight: '700' },
  hint: { textAlign: 'center', marginTop: 4, fontSize: 11, color: '#94A3B8' },
});

export default MonthYearFilter;
