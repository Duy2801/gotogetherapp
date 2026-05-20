import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { SpendingStatisticsCategory } from '../../spending/api';
import { formatMoney } from '../../../utils/format';
import { useTranslation } from '../../../hooks/useTranslation';

type Props = {
  categories: SpendingStatisticsCategory[];
  selectedTripName?: string | null;
};

const CategoriesSummarySection = ({
  categories,
  selectedTripName,
}: Props) => {
  const { t } = useTranslation();

  const renderCategoryIcon = (item: SpendingStatisticsCategory) => {
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
    <>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>{t('statistics.categoriesTitle')}</Text>
        {!!selectedTripName && (
          <Text style={styles.selectedTripText} numberOfLines={1}>
            {selectedTripName}
          </Text>
        )}
      </View>

      {categories.length ? (
        <View style={styles.categoryList}>
          {categories.map(item => (
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
                <Text style={styles.categoryName}>{item.categoryName}</Text>
                <Text style={styles.categorySubText}>
                  {item.expenseCount} khoản • {item.percentage}%
                </Text>
              </View>
              <Text style={styles.categoryAmount}>{formatMoney(item.totalAmount)}</Text>
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
          <Text style={styles.emptyText}>{t('statistics.noCategoryData')}</Text>
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
  selectedTripText: {
    flex: 1,
    textAlign: 'right',
    color: '#6B7280',
    fontSize: 12,
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
});

export default CategoriesSummarySection;