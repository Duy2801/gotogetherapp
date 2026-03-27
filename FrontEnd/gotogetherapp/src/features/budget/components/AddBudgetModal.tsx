import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { PRIMARY_COLOR } from '../../../constants/color';
import { Budget, budgetApi, CreateBudgetDto, UpdateBudgetDto } from '../api';
import { formatAmountInput, formatCurrency } from '../../../utils/format';

interface AddBudgetModalProps {
  visible: boolean;
  budget: Budget | null;
  month: number;
  year: number;
  onClose: (refresh: boolean) => void;
}

// Predefined categories - in real app, these would come from an API
const CATEGORIES = [
  { id: null, name: 'Tổng ngân sách', icon: 'wallet', color: '#159947' },
  { id: 'food', name: 'Ăn uống', icon: 'utensils', color: '#EF4444' },
  { id: 'transport', name: 'Di chuyển', icon: 'car', color: '#3B82F6' },
  { id: 'hotel', name: 'Lưu trú', icon: 'hotel', color: '#8B5CF6' },
  { id: 'shopping', name: 'Mua sắm', icon: 'shopping-bag', color: '#EC4899' },
  {
    id: 'entertainment',
    name: 'Giải trí',
    icon: 'masks-theater',
    color: '#F59E0B',
  },
  { id: 'other', name: 'Khác', icon: 'ellipsis', color: '#6B7280' },
];

const AddBudgetModal = ({
  visible,
  budget,
  month,
  year,
  onClose,
}: AddBudgetModalProps) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [amount, setAmount] = useState('');
  const [warningAt, setWarningAt] = useState('80');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      if (budget) {
        setAmount(budget.amount.toString());
        setWarningAt(budget.warningAt.toString());
      } else {
        setAmount('');
        setWarningAt('80');
      }
    }
  }, [visible, budget]);

  const handleSave = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập số tiền hợp lệ');
      return;
    }

    const warningAtNum = parseInt(warningAt) || 80;
    if (warningAtNum < 0 || warningAtNum > 100) {
      Alert.alert('Lỗi', 'Ngưỡng cảnh báo phải từ 0-100%');
      return;
    }

    setLoading(true);
    try {
      if (budget) {
        const dto: UpdateBudgetDto = {
          amount: parseFloat(amount),
          warningAt: warningAtNum,
        };
        await budgetApi.updateBudget(budget.id, dto);
      } else {
        const dto: CreateBudgetDto = {
          categoryId: selectedCategoryId || undefined,
          amount: parseFloat(amount),
          month,
          year,
          warningAt: warningAtNum,
        };
        await budgetApi.createBudget(dto);
      }
      onClose(true);
    } catch (error: any) {
      Alert.alert(
        'Lỗi',
        error?.error || error?.message || 'Không thể lưu ngân sách',
      );
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    return cleaned;
  };

  const selectedCategory =
    CATEGORIES.find(c => c.id === selectedCategoryId) || CATEGORIES[0];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={() => onClose(false)}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {budget ? 'Chỉnh sửa ngân sách' : 'Thêm ngân sách mới'}
            </Text>
            <TouchableOpacity
              onPress={() => onClose(false)}
              style={styles.closeButton}
            >
              <FontAwesome6
                name="xmark"
                size={20}
                color="#64748B"
                iconStyle="solid"
              />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.section}>
              <Text style={styles.label}>Hạng mục</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryGrid}
              >
                {CATEGORIES.map(category => (
                  <TouchableOpacity
                    key={category.id || 'total'}
                    style={[
                      styles.categoryCard,
                      selectedCategoryId === category.id &&
                      styles.categoryCardSelected,
                    ]}
                    onPress={() => setSelectedCategoryId(category.id)}
                    disabled={!!budget}
                  >
                    <View
                      style={[
                        styles.categoryIcon,
                        { backgroundColor: category.color },
                      ]}
                    >
                      <FontAwesome6
                        name={category.icon as any}
                        size={20}
                        color="#FFFFFF"
                        iconStyle="solid"
                      />
                    </View>
                    <Text style={styles.categoryName}>{category.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {budget && (
                <Text style={styles.hint}>
                  Không thể thay đổi hạng mục khi chỉnh sửa
                </Text>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Số tiền (VND)</Text>
              <View style={styles.inputContainer}>
                <FontAwesome6
                  name="money-bill-wave"
                  size={16}
                  color="#64748B"
                  iconStyle="solid"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Nhập số tiền"
                  keyboardType="numeric"
                  value={formatAmountInput(amount)}
                  onChangeText={text => setAmount(formatAmount(text))}
                />
              </View>
            </View>
            {amount && parseFloat(amount) > 0 && (
              <View style={styles.preview}>
                <View
                  style={[
                    styles.previewIcon,
                    { backgroundColor: selectedCategory.color },
                  ]}
                >
                  <FontAwesome6
                    name={selectedCategory.icon as any}
                    size={24}
                    color="#FFFFFF"
                    iconStyle="solid"
                  />
                </View>
                <View style={styles.previewContent}>
                  <Text style={styles.previewLabel}>
                    {selectedCategory.name}
                  </Text>
                  <Text style={styles.previewAmount}>
                    {formatCurrency(parseInt(amount))}
                  </Text>
                  <Text style={styles.previewHint}>
                    Cảnh báo khi đã chi {warningAt || 80}%
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => onClose(false)}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>
                  {budget ? 'Cập nhật' : 'Thêm'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 20,
    gap: 24,
  },
  section: {
    gap: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  categoryGrid: {
    gap: 10,
    paddingVertical: 4,
  },
  categoryCard: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    minWidth: 90,
  },
  categoryCardSelected: {
    borderColor: PRIMARY_COLOR,
    backgroundColor: '#E7F0E8',
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
  },
  hint: {
    fontSize: 12,
    color: '#6B7280',
  },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    backgroundColor: '#F4F7F4',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E7F0E8',
  },
  previewIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewContent: {
    flex: 1,
  },
  previewLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  previewAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  previewHint: {
    fontSize: 11,
    color: '#64748B',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F1F5F9',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  saveButton: {
    backgroundColor: PRIMARY_COLOR,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default AddBudgetModal;
