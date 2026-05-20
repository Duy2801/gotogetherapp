import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { SECONDARY_COLOR } from '../constants/color';

const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

type Props = {
  month: number;
  year: number;
  onPress?: () => void;
  style?: any;
  textStyle?: any;
};

const MonthFilterButton = ({ month, year, onPress, style, textStyle }: Props) => {
  const label = `${monthNames[month - 1]} · ${year}`;

  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.content}>
        <Text style={[styles.label, textStyle]}>{label}</Text>
        <FontAwesome6 name="chevron-down" size={12} color={SECONDARY_COLOR} iconStyle="solid" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6F0EA',
  },
  content: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { color: SECONDARY_COLOR, fontWeight: '700' },
});

export default MonthFilterButton;
