import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { Budget } from '../api';

interface BudgetItemProps {
  budget: Budget;
  onEdit: (budget: Budget) => void;
  onDelete: (budget: Budget) => void;
  formatCurrency: (value: number) => string;
  formatCompactMoney: (value: number) => string;
}

const BudgetItem = ({
  budget,
  onEdit,
  onDelete,
  formatCurrency,
  formatCompactMoney,
}: BudgetItemProps) => {
  const getProgressColor = () => {
    if (budget.isOverBudget) return '#EF4444';
    if (budget.isWarning) return '#F59E0B';
    return '#22C55E';
  };

  const getIconName = () => {
    return 'wallet';
  };

  const getBgColor = () => {
    if (budget.isOverBudget) return '#FEF2F2';
    if (budget.isWarning) return '#FFFBEB';
    return '#FFFFFF';
  };

  const getBorderColor = () => {
    if (budget.isOverBudget) return '#FEE2E2';
    if (budget.isWarning) return '#FEF3C7';
    return '#E5E7EB';
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: getBgColor(), borderColor: getBorderColor() },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <View style={[styles.iconCircle, { backgroundColor: '#E7F0E8' }]}>
            <FontAwesome6
              name={getIconName() as any}
              size={16}
              color={'#159947'}
              iconStyle="solid"
            />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{'Tổng ngân sách'}</Text>
            <Text style={styles.subtitle}>
              Đã dùng {budget.percentage}% • Còn{' '}
              {formatCompactMoney(budget.remaining)}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => onEdit(budget)}
            style={styles.actionButton}
          >
            <FontAwesome6
              name="pen"
              size={14}
              color="#64748B"
              iconStyle="solid"
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onDelete(budget)}
            style={styles.actionButton}
          >
            <FontAwesome6
              name="trash"
              size={14}
              color="#EF4444"
              iconStyle="solid"
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${Math.min(budget.percentage, 100)}%`,
              backgroundColor: getProgressColor(),
            },
          ]}
        />
      </View>

      <View style={styles.amountRow}>
        <View style={styles.amountItem}>
          <Text style={styles.amountLabel}>Đã chi</Text>
          <Text style={[styles.amountValue, { color: getProgressColor() }]}>
            {formatCompactMoney(budget.spent)}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.amountItem}>
          <Text style={styles.amountLabel}>Ngân sách</Text>
          <Text style={styles.amountValue}>
            {formatCompactMoney(budget.amount)}
          </Text>
        </View>
      </View>

      {budget.isOverBudget && (
        <View style={styles.warningBanner}>
          <FontAwesome6
            name="triangle-exclamation"
            size={12}
            color="#DC2626"
            iconStyle="solid"
          />
          <Text style={styles.warningText}>Đã vượt ngân sách!</Text>
        </View>
      )}

      {budget.isWarning && !budget.isOverBudget && (
        <View style={[styles.warningBanner, { backgroundColor: '#FEF3C7' }]}>
          <FontAwesome6
            name="triangle-exclamation"
            size={12}
            color="#D97706"
            iconStyle="solid"
          />
          <Text style={[styles.warningText, { color: '#92400E' }]}>
            Sắp hết ngân sách ({budget.warningAt}%)
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBar: {
    height: 8,
    borderRadius: 99,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 99,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountItem: {
    flex: 1,
  },
  amountLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 2,
  },
  amountValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 12,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  warningText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#991B1B',
  },
});

export default BudgetItem;
