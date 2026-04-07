import { StyleSheet, Text, View } from 'react-native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { Budget } from '../api';

interface BudgetCategoryItemProps {
  budget: Budget;
  isLast: boolean;
  formatCompactMoney: (value: number) => string;
}

const BudgetCategoryItem = ({
  budget,
  isLast,
  formatCompactMoney,
}: BudgetCategoryItemProps) => {
  const getStatusColor = () => {
    if (budget.isOverBudget) return '#EF4444';
    if (budget.isWarning) return '#F59E0B';
    return '#22C55E';
  };

  const getIconName = () => {
    return 'wallet';
  };

  const getStatusIcon = () => {
    if (budget.isOverBudget) return 'circle-exclamation';
    if (budget.isWarning) return 'triangle-exclamation';
    return 'circle-check';
  };

  return (
    <View style={[styles.container, !isLast && styles.containerWithBorder]}>
      <View style={styles.iconWrap}>
        <View style={[styles.iconCircle, { backgroundColor: '#E7F0E8' }]}>
          <FontAwesome6
            name={getIconName() as any}
            size={14}
            color="#FFFFFF"
            iconStyle="solid"
          />
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.categoryName}>{'Tổng ngân sách'}</Text>
          <View style={styles.statusRow}>
            <FontAwesome6
              name={getStatusIcon()}
              size={12}
              color={getStatusColor()}
              iconStyle="solid"
            />
            <Text style={[styles.percentage, { color: getStatusColor() }]}>
              {budget.percentage}%
            </Text>
          </View>
        </View>

        <View style={styles.amountRow}>
          <Text style={styles.spent}>
            Đã chi: {formatCompactMoney(budget.spent)}
          </Text>
          <Text style={styles.divider}>•</Text>
          <Text style={styles.total}>
            Ngân sách: {formatCompactMoney(budget.amount)}
          </Text>
        </View>

        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(budget.percentage, 100)}%`,
                backgroundColor: getStatusColor(),
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 12,
    gap: 12,
  },
  containerWithBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  iconWrap: {
    paddingTop: 2,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  percentage: {
    fontSize: 13,
    fontWeight: '700',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  spent: {
    fontSize: 12,
    color: '#64748B',
  },
  divider: {
    fontSize: 12,
    color: '#CBD5E1',
  },
  total: {
    fontSize: 12,
    color: '#64748B',
  },
  progressBar: {
    height: 6,
    borderRadius: 99,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 99,
  },
});

export default BudgetCategoryItem;
