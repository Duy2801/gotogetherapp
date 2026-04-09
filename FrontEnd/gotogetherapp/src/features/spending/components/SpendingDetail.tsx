import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reducers/store';
import { PRIMARY_COLOR, SECONDARY_COLOR } from '../../../constants/color';
import {
  tripDetailApi,
  TripDetail,
  Expense,
  Member,
} from '../../tripdetail/api';
import {
  formatMoney,
  formatDate,
  formatCompactMoney,
} from '../../../utils/format';
import { useSocket } from '../../../services/useSocket';
import { useTranslation } from '../../../hooks/useTranslation';

type TabType = 'info' | 'expenses' | 'settlement';

interface SettlementItem {
  from: Member;
  to: Member;
  amount: number;
  status: 'UNPAID' | 'PAID' | 'CONFIRMED';
}

const SpendingDetail = ({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) => {
  const tripId = route.params?.tripId;
  const tripIds = route.params?.tripIds;
  const currentUser = useSelector((state: RootState) => state.login.user);
  const { socket } = useSocket();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<TabType>('info');
  const [tripDataList, setTripDataList] = useState<TripDetail[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const fetchData = useCallback(async () => {
    const ids = tripIds || (tripId ? [tripId] : []);
    if (ids.length === 0 || !currentUser?.id) return;
    try {
      const tripRequests = ids.map((id: string) =>
        tripDetailApi.getTripDetail(id),
      );
      const expenseRequests = ids.map((id: string) =>
        tripDetailApi.getTripExpenses(id, { page: 1, limit: 100 }),
      );

      const tripResults = await Promise.all(tripRequests);
      const expenseResults = await Promise.all(expenseRequests);

      setTripDataList(tripResults.map(res => res.data));

      // Combine expenses from all trips
      const allExpenses = expenseResults.flatMap(
        res => res.data.expenses || [],
      );
      setExpenses(allExpenses);
    } catch (error) {
      console.error('Failed to fetch trip data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [tripIds, tripId, currentUser?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Join trip rooms on mount
  useEffect(() => {
    if (!socket) {
      console.warn('⚠️ Socket not available in SpendingDetail');
      return;
    }

    if (!socket.connected) {
      console.warn('⚠️ Socket not connected in SpendingDetail. Waiting...');
      const timer = setTimeout(() => {
        const ids = tripIds || (tripId ? [tripId] : []);
        ids.forEach((id: string) => {
          if (id && socket.connected) {
            socket.emit('join:trip', id);
            console.log('✓ Joined trip room (after reconnect):', id);
          }
        });
      }, 1500);
      return () => clearTimeout(timer);
    }

    const ids = tripIds || (tripId ? [tripId] : []);
    ids.forEach((id: string) => {
      if (id) {
        socket.emit('join:trip', id);
        console.log('✓ Joined trip room:', id);
        console.log('   Socket ID:', socket.id);
      }
    });

    return () => {
      // Leave rooms on unmount
      ids.forEach((id: string) => {
        if (id) {
          socket.emit('leave:trip', id);
          console.log('✗ Left trip room:', id);
        }
      });
    };
  }, [socket, tripIds, tripId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  // Calculate settlement matrix from all trips
  const settledItems = useMemo(() => {
    const items: SettlementItem[] = [];
    const settledMap = new Map<string, SettlementItem>();

    // Get all members from all trips
    const allMembers: Member[] = [];
    const memberMap = new Map<string, Member>();
    tripDataList.forEach(trip => {
      trip.members?.forEach(member => {
        if (!memberMap.has(member.userId)) {
          memberMap.set(member.userId, member);
          allMembers.push(member);
        }
      });
    });

    expenses.forEach(expense => {
      expense.splits?.forEach(split => {
        // If user is not the payer, they owe money
        if (split.userId !== expense.paidBy.id) {
          const key = `${split.userId}-${expense.paidBy.id}`;
          const from = memberMap.get(split.userId);
          const to = memberMap.get(expense.paidBy.id);

          if (from && to) {
            if (settledMap.has(key)) {
              const item = settledMap.get(key)!;
              item.amount += split.amount;
            } else {
              settledMap.set(key, {
                from,
                to,
                amount: split.amount,
                status: split.confirmed
                  ? 'CONFIRMED'
                  : split.isPaid
                  ? 'PAID'
                  : 'UNPAID',
              });
            }
          }
        }
      });
    });

    return Array.from(settledMap.values()).sort((a, b) => b.amount - a.amount);
  }, [expenses, tripDataList]);

  const totalSpent = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses],
  );

  // Calculate per-member breakdown from all trips
  const memberBreakdown = useMemo(() => {
    const breakdown: Record<
      string,
      { paid: number; owes: number; member: Member }
    > = {};

    // Initialize all members from all trips
    tripDataList.forEach(trip => {
      trip.members?.forEach(member => {
        if (!breakdown[member.userId]) {
          breakdown[member.userId] = { paid: 0, owes: 0, member };
        }
      });
    });

    // Aggregate from all expenses
    expenses.forEach(expense => {
      // Payer
      if (breakdown[expense.paidBy.id]) {
        breakdown[expense.paidBy.id].paid += expense.amount;
      }

      // Splits
      expense.splits?.forEach(split => {
        if (breakdown[split.userId]) {
          breakdown[split.userId].owes += split.amount;
        }
      });
    });

    return Object.values(breakdown);
  }, [expenses, tripDataList]);

  if (loading) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        </View>
      </SafeAreaView>
    );
  }

  if (!tripDataList || tripDataList.length === 0) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        <Text style={styles.errorText}>Không thể tải dữ liệu chuyến đi</Text>
      </SafeAreaView>
    );
  }

  // For header display
  const primaryTrip = tripDataList[0];
  const tripCount = tripDataList.length;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <FontAwesome6
            name="chevron-left"
            size={20}
            color="#111827"
            iconStyle="solid"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {tripCount > 1 ? `${tripCount} chuyến đi` : primaryTrip.name}
        </Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {(['info', 'expenses', 'settlement'] as TabType[]).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, selectedTab === tab && styles.tabActive]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === tab && styles.tabTextActive,
              ]}
            >
              {tab === 'info' && 'Thông tin'}
              {tab === 'expenses' && 'Chi phí'}
              {tab === 'settlement' && 'Chia tiền'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[PRIMARY_COLOR]}
          />
        }
      >
        {selectedTab === 'info' && (
          <MultiTripInfoTab
            tripDataList={tripDataList}
            memberBreakdown={memberBreakdown}
          />
        )}
        {selectedTab === 'expenses' && <ExpensesTab expenses={expenses} />}
        {selectedTab === 'settlement' && (
          <SettlementTab items={settledItems} totalSpent={totalSpent} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// Trip Info Tab - display single or multiple trip info
const TripInfoTab = ({
  trip,
  memberBreakdown,
}: {
  trip: TripDetail;
  memberBreakdown: Array<{ paid: number; owes: number; member: Member }>;
}) => (
  <View style={styles.tabContent}>
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Thông tin chuyến đi</Text>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Tên chuyến đi:</Text>
          <Text style={styles.infoValue}>{trip.name}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Thời gian:</Text>
          <Text style={styles.infoValue}>
            {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Trạng thái:</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(trip.status) },
            ]}
          >
            <Text style={styles.statusText}>
              {translateStatus(trip.status)}
            </Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Tổng ngân sách:</Text>
          <Text style={styles.infoValue}>
            {formatMoney(trip.totalBudget || 0)}
          </Text>
        </View>
      </View>
    </View>

    {/* Members Breakdown */}
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <FontAwesome6
          name="users"
          size={16}
          color={SECONDARY_COLOR}
          iconStyle="solid"
        />
        <Text style={styles.cardTitle}>
          Thành viên & Tính toán ({trip.memberCount})
        </Text>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.breakdownHeader}>
          <Text style={styles.breakdownLabel}>Người</Text>
          <Text style={styles.breakdownLabel}>Đã trả</Text>
          <Text style={styles.breakdownLabel}>Nợ</Text>
          <Text style={styles.breakdownLabel}>Chênh lệch</Text>
        </View>

        {memberBreakdown.map((item, idx) => {
          const balance = item.paid - item.owes;
          const isPositive = balance > 0;
          return (
            <View
              key={item.member.id}
              style={[
                styles.breakdownRow,
                idx > 0 && styles.breakdownRowBorder,
              ]}
            >
              <View style={styles.memberCol}>
                {item.member.avatar ? (
                  <Image
                    source={{ uri: item.member.avatar }}
                    style={styles.memberAvatar}
                  />
                ) : (
                  <View style={[styles.memberAvatar, styles.avatarFallback]}>
                    <Text style={styles.avatarText}>
                      {item.member.fullName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                <Text style={styles.memberNameSmall}>
                  {item.member.fullName}
                </Text>
              </View>
              <Text style={styles.breakdownValue}>
                {formatMoney(item.paid)}
              </Text>
              <Text style={styles.breakdownValue}>
                {formatMoney(item.owes)}
              </Text>
              <Text
                style={[
                  styles.balanceValue,
                  { color: isPositive ? '#10B981' : '#EF4444' },
                ]}
              >
                {isPositive ? '+' : ''}
                {formatMoney(balance)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  </View>
);

// Multi Trip Info Tab - display info for multiple trips
const MultiTripInfoTab = ({
  tripDataList,
  memberBreakdown,
}: {
  tripDataList: TripDetail[];
  memberBreakdown: Array<{ paid: number; owes: number; member: Member }>;
}) => (
  <View style={styles.tabContent}>
    {/* Trip list */}
    {tripDataList.map(trip => (
      <View key={trip.id} style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{trip.name}</Text>
        </View>
        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Thời gian:</Text>
            <Text style={styles.infoValue}>
              {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Trạng thái:</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(trip.status) },
              ]}
            >
              <Text style={styles.statusText}>
                {translateStatus(trip.status)}
              </Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tổng ngân sách:</Text>
            <Text style={styles.infoValue}>
              {formatMoney(trip.totalBudget || 0)}
            </Text>
          </View>
        </View>
      </View>
    ))}

    {/* Members Breakdown across all trips */}
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <FontAwesome6
          name="users"
          size={16}
          color={SECONDARY_COLOR}
          iconStyle="solid"
        />
        <Text style={styles.cardTitle}>{t('spending.allTripsSummary')}</Text>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.breakdownHeader}>
          <Text style={styles.breakdownLabel}>{t('spending.personLabel')}</Text>
          <Text style={styles.breakdownLabel}>{t('spending.paidLabel')}</Text>
          <Text style={styles.breakdownLabel}>{t('spending.debtLabel')}</Text>
          <Text style={styles.breakdownLabel}>Chênh lệch</Text>
        </View>

        {memberBreakdown.map((item, idx) => {
          const balance = item.paid - item.owes;
          const isPositive = balance > 0;
          return (
            <View
              key={item.member.id}
              style={[
                styles.breakdownRow,
                idx > 0 && styles.breakdownRowBorder,
              ]}
            >
              <View style={styles.memberCol}>
                {item.member.avatar ? (
                  <Image
                    source={{ uri: item.member.avatar }}
                    style={styles.memberAvatar}
                  />
                ) : (
                  <View style={[styles.memberAvatar, styles.avatarFallback]}>
                    <Text style={styles.avatarText}>
                      {item.member.fullName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                <Text style={styles.memberNameSmall}>
                  {item.member.fullName}
                </Text>
              </View>
              <Text style={styles.breakdownValue}>
                {formatMoney(item.paid)}
              </Text>
              <Text style={styles.breakdownValue}>
                {formatMoney(item.owes)}
              </Text>
              <Text
                style={[
                  styles.balanceValue,
                  { color: isPositive ? '#10B981' : '#EF4444' },
                ]}
              >
                {isPositive ? '+' : ''}
                {formatMoney(balance)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  </View>
);

// Expenses Tab - display detailed expense list
const ExpensesTab = ({ expenses }: { expenses: Expense[] }) => (
  <View style={styles.tabContent}>
    {expenses.length === 0 ? (
      <View style={styles.emptyCard}>
        <FontAwesome6
          name="receipt"
          size={32}
          color="#D1D5DB"
          iconStyle="solid"
        />
        <Text style={styles.emptyText}>{t('expense.noExpenses')}</Text>
      </View>
    ) : (
      expenses.map((expense, idx) => (
        <View key={expense.id} style={styles.expenseCard}>
          <View style={styles.expenseHeader}>
            <View style={styles.expenseCategory}>
              <FontAwesome6
                name="tag"
                size={12}
                color={PRIMARY_COLOR}
                iconStyle="solid"
              />
              <Text style={styles.expenseCategoryText}>
                {expense.category?.name || t('common.other')}
              </Text>
            </View>
            <Text style={styles.expenseAmount}>
              {formatMoney(expense.amount)}
            </Text>
          </View>
          <Text style={styles.expenseDesc}>{expense.description}</Text>
          <Text style={styles.expenseDate}>{formatDate(expense.date)}</Text>

          {/* Payer info */}
          <View style={styles.payerRow}>
            {expense.paidBy.avatar ? (
              <Image
                source={{ uri: expense.paidBy.avatar }}
                style={styles.payerAvatar}
              />
            ) : (
              <View style={[styles.payerAvatar, styles.avatarFallback]}>
                <Text style={styles.avatarText}>
                  {expense.paidBy.fullName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.payerInfo}>
              <Text style={styles.payerLabel}>{t('expense.paidBy')}</Text>
              <Text style={styles.payerName}>{expense.paidBy.fullName}</Text>
            </View>
          </View>

          {/* Splits breakdown - hiển thị cách chia tiền */}
          {expense.splits && expense.splits.length > 0 && (
            <View style={styles.splitsContainer}>
              <Text style={styles.splitsTitle}>
                {t('expense.splitWith')} {expense.splits.length}{' '}
                {t('common.user')} (
                {formatMoney(expense.amount / expense.splits.length)}):
              </Text>
              {expense.splits.map((split, i) => (
                <View key={split.id} style={styles.splitRow}>
                  <View style={styles.splitUserInfo}>
                    {split.user.avatar ? (
                      <Image
                        source={{ uri: split.user.avatar }}
                        style={styles.splitAvatar}
                      />
                    ) : (
                      <View style={[styles.splitAvatar, styles.avatarFallback]}>
                        <Text style={styles.avatarSmall}>
                          {split.user.fullName.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                    <Text style={styles.splitUser}>{split.user.fullName}</Text>
                  </View>
                  <View style={styles.splitStatusCol}>
                    <Text style={styles.splitAmount}>
                      {formatMoney(split.amount)}
                    </Text>
                    <View
                      style={[
                        styles.splitStatusBadge,
                        {
                          backgroundColor: split.confirmed
                            ? '#ECFDF5'
                            : split.isPaid
                            ? '#FEF3C7'
                            : '#FEE2E2',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.splitStatusText,
                          {
                            color: split.confirmed
                              ? '#059669'
                              : split.isPaid
                              ? '#92400E'
                              : '#DC2626',
                          },
                        ]}
                      >
                        {split.confirmed
                          ? t('common.success')
                          : split.isPaid
                          ? t('common.yes')
                          : t('common.no')}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      ))
    )}
  </View>
);

// Settlement Tab - settlement calculation across trips
const SettlementTab = ({
  items,
  totalSpent,
}: {
  items: SettlementItem[];
  totalSpent: number;
}) => (
  <View style={styles.tabContent}>
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <FontAwesome6
          name="scale-balanced"
          size={16}
          color={PRIMARY_COLOR}
          iconStyle="solid"
        />
        <Text style={styles.cardTitle}>{t('spending.overviewTitle')}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.settlementSummary}>
          {t('spending.spent')}: {formatMoney(totalSpent)}
        </Text>

        {items.length === 0 ? (
          <Text style={styles.emptySettlement}>{t('common.success')}</Text>
        ) : (
          <>
            <Text style={styles.settlementInfo}>
              {items.length} {t('spending.paymentTitle')}
            </Text>
            {items.map((item, idx) => (
              <View key={idx} style={styles.settlementRow}>
                <View style={styles.settlementPeople}>
                  {item.from.avatar ? (
                    <Image
                      source={{ uri: item.from.avatar }}
                      style={styles.settlementAvatar}
                    />
                  ) : (
                    <View
                      style={[styles.settlementAvatar, styles.avatarFallback]}
                    >
                      <Text style={styles.avatarSmall}>
                        {item.from.fullName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.settlementFromName}>
                    {item.from.fullName}
                  </Text>

                  <FontAwesome6
                    name="arrow-right"
                    size={14}
                    color="#9CA3AF"
                    iconStyle="solid"
                    style={styles.arrowIcon}
                  />

                  {item.to.avatar ? (
                    <Image
                      source={{ uri: item.to.avatar }}
                      style={styles.settlementAvatar}
                    />
                  ) : (
                    <View
                      style={[styles.settlementAvatar, styles.avatarFallback]}
                    >
                      <Text style={styles.avatarSmall}>
                        {item.to.fullName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.settlementToName}>
                    {item.to.fullName}
                  </Text>
                </View>

                <View style={styles.settlementRight}>
                  <Text
                    style={[
                      styles.settlementAmount,
                      { color: getStatusColor(item.status) },
                    ]}
                  >
                    {formatMoney(item.amount)}
                  </Text>
                  <View style={styles.statusRow}>
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: getStatusColor(item.status) },
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusLabel,
                        { color: getStatusColor(item.status) },
                      ]}
                    >
                      {item.status === 'CONFIRMED' && t('common.success')}
                      {item.status === 'PAID' && t('common.yes')}
                      {item.status === 'UNPAID' && t('common.no')}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}
      </View>
    </View>
  </View>
);

// Utils
const getStatusColor = (status: string): string => {
  if (status === 'CONFIRMED') return '#10B981';
  if (status === 'PAID') return '#F59E0B';
  if (status === 'COMPLETED' || status === 'ONGOING') return '#3B82F6';
  if (status === 'UPCOMING') return '#8B5CF6';
  return '#EF4444'; // UNPAID
};

const translateStatus = (status: string): string => {
  const map: Record<string, string> = {
    UPCOMING: 'Sắp diễn ra',
    ONGOING: 'Đang diễn ra',
    COMPLETED: 'Đã kết thúc',
    ARCHIVED: 'Đã lưu trữ',
  };
  return map[status] || status;
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
    textAlign: 'center',
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  headerPlaceholder: {
    width: 40,
  },
  summaryScroll: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  summaryContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  summaryCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: 110,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  tabActive: {
    backgroundColor: SECONDARY_COLOR,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 24,
    gap: 12,
  },
  tabContent: {
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  cardBody: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    textAlign: 'right',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Breakdown table
  breakdownHeader: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginBottom: 8,
    gap: 8,
  },
  breakdownLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    flex: 1,
    textAlign: 'center',
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 8,
  },
  breakdownRowBorder: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  memberCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  memberAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  memberNameSmall: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  breakdownValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
    textAlign: 'center',
  },
  balanceValue: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },

  avatarFallback: {
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  avatarSmall: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2937',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 32,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
  },

  // Expenses
  expenseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expenseCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  expenseCategoryText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  expenseAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  expenseDesc: {
    fontSize: 13,
    color: '#374151',
  },
  expenseDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  payerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  payerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  payerInfo: {
    flex: 1,
  },
  payerLabel: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  payerName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },

  // Splits (chia tiền)
  splitsContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 8,
    gap: 6,
  },
  splitsTitle: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 4,
  },
  splitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 6,
  },
  splitUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  splitAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  splitUser: {
    fontSize: 12,
    color: '#374151',
    flex: 1,
  },
  splitStatusCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  splitAmount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  splitStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  splitStatusText: {
    fontSize: 10,
    fontWeight: '600',
  },

  // Settlement
  settlementSummary: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    textAlign: 'center',
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  settlementInfo: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  emptySettlement: {
    fontSize: 13,
    color: '#10B981',
    textAlign: 'center',
    paddingVertical: 12,
    fontWeight: '600',
  },
  settlementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    marginVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  settlementPeople: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  settlementAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  settlementFromName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    maxWidth: 50,
  },
  settlementToName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    maxWidth: 50,
  },
  arrowIcon: {
    marginHorizontal: 4,
  },
  settlementRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  settlementAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
});

export default SpendingDetail;
