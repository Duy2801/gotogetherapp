import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reducers/store';
import { PRIMARY_COLOR, SECONDARY_COLOR } from '../../../constants/color';
import { spendingApi } from '../api';
import {
  formatCompactMoney,
  formatMoney,
  formatDate,
} from '../../../utils/format';
import { PaymentFilter, FilterType } from './PaymentFilter';
import { SCREEN_NAME } from '../../../constants/screenName';
import { socketService } from '../../../services/socket.service';

const PaymentDetailScreen = ({ navigation }: { navigation: any }) => {
  const currentUser = useSelector((state: RootState) => state.login.user);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [errorText, setErrorText] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [detailModalGroup, setDetailModalGroup] = useState<any | null>(null);
  const [groups, setGroups] = useState<{
    debtGroups: any[];
    receivableGroups: any[];
  }>({
    debtGroups: [],
    receivableGroups: [],
  });

  const fetchData = useCallback(async () => {
    if (!currentUser?.id) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      setErrorText('');
      const result = await spendingApi.getPaymentDetailGroups(currentUser.id);
      setGroups(result);
    } catch (error: any) {
      setErrorText(
        error?.error || error?.message || 'Không thể tải chi tiết thanh toán',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  // Collect all unique trips across both debt and receivable groups
  const allTrips = useMemo(() => {
    const tripMap = new Map<string, string>();
    const allGroups = [...groups.debtGroups, ...groups.receivableGroups];
    allGroups.forEach(group => {
      group.items?.forEach((item: any) => {
        if (item.tripId && item.tripName) {
          tripMap.set(item.tripId, item.tripName);
        }
      });
    });
    return Array.from(tripMap.entries()).map(([id, name]) => ({ id, name }));
  }, [groups]);

  // Filter groups by type and trip
  const filteredDebtGroups = useMemo(() => {
    if (filterType === 'receivable') return [];
    return groups.debtGroups
      .map(group => {
        if (!selectedTripId) return group;
        const filteredItems = group.items.filter(
          (item: any) => item.tripId === selectedTripId,
        );
        if (!filteredItems.length) return null;
        const totalAmount = filteredItems.reduce(
          (sum: number, item: any) => sum + item.amount,
          0,
        );
        return { ...group, items: filteredItems, totalAmount };
      })
      .filter(Boolean);
  }, [groups.debtGroups, filterType, selectedTripId]);

  const filteredReceivableGroups = useMemo(() => {
    if (filterType === 'debt') return [];
    return groups.receivableGroups
      .map(group => {
        if (!selectedTripId) return group;
        const filteredItems = group.items.filter(
          (item: any) => item.tripId === selectedTripId,
        );
        if (!filteredItems.length) return null;
        const totalAmount = filteredItems.reduce(
          (sum: number, item: any) => sum + item.amount,
          0,
        );
        return { ...group, items: filteredItems, totalAmount };
      })
      .filter(Boolean);
  }, [groups.receivableGroups, filterType, selectedTripId]);

  const debtTotal = useMemo(
    () =>
      filteredDebtGroups.reduce(
        (sum: number, group: any) => sum + group.totalAmount,
        0,
      ),
    [filteredDebtGroups],
  );

  const receivableTotal = useMemo(
    () =>
      filteredReceivableGroups.reduce(
        (sum: number, group: any) => sum + group.totalAmount,
        0,
      ),
    [filteredReceivableGroups],
  );

  const handleMarkAsPaid = async (splitId: string) => {
    try {
      setActionLoadingId(splitId);
      await spendingApi.markSplitAsPaid(splitId);
      await fetchData();
      Alert.alert('Thành công', 'Đã đánh dấu khoản này là đã trả.');
    } catch (error: any) {
      Alert.alert(
        'Không thể cập nhật',
        error?.error || error?.message || 'Không thể đánh dấu đã trả.',
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirmReceived = async (splitId: string) => {
    try {
      setActionLoadingId(splitId);
      await spendingApi.confirmSplitReceived(splitId);
      await fetchData();
      Alert.alert('Thành công', 'Đã xác nhận nhận tiền.');
    } catch (error: any) {
      Alert.alert(
        'Không thể xác nhận',
        error?.error || error?.message || 'Không thể xác nhận đã nhận tiền.',
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRemind = async (userData: { name: string; userId: string; amount: number }) => {
    const message = `Nhắc bạn chuyển cho tôi ${formatMoney(userData.amount)} cho khoản chi phí chuyến đi. Cảm ơn ${userData.name}.`;
    try {
      setActionLoadingId(`remind-${userData.userId}`);
      await spendingApi.sendReminder(userData.userId, message);
      Alert.alert('Thành công', 'Đã gửi nhắc nhở cho ' + userData.name);
    } catch (error: any) {
      Alert.alert(
        'Không thể gửi nhắc nhở',
        error?.error || error?.message || 'Vui lòng thử lại sau.',
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  // Group items by trip inside a group (for detail modal)
  const groupItemsByTrip = (items: any[]) => {
    const tripMap = new Map<
      string,
      { tripName: string; items: any[]; total: number }
    >();
    items.forEach(item => {
      const existing = tripMap.get(item.tripId);
      if (existing) {
        existing.items.push(item);
        existing.total += item.amount;
      } else {
        tripMap.set(item.tripId, {
          tripName: item.tripName,
          items: [item],
          total: item.amount,
        });
      }
    });
    return Array.from(tripMap.values());
  };

  const renderDetailModal = () => {
    if (!detailModalGroup) return null;
    const { group, type } = detailModalGroup;
    const tripBreakdowns = groupItemsByTrip(group.items);

    // Join trip rooms when modal opens
    React.useEffect(() => {
      tripBreakdowns.forEach(trip => {
        if (trip.tripName) {
          const tripId = group.items.find(item => item.tripName === trip.tripName)?.tripId;
          if (tripId) {
            socketService.joinTrip(tripId);
          }
        }
      });

      return () => {
        // Leave trip rooms when modal closes
        tripBreakdowns.forEach(trip => {
          const tripId = group.items.find(item => item.tripName === trip.tripName)?.tripId;
          if (tripId) {
            socketService.leaveTrip(tripId);
          }
        });
      };
    }, [detailModalGroup]);

    return (
      <Modal
        visible={!!detailModalGroup}
        transparent
        animationType="slide"
        onRequestClose={() => setDetailModalGroup(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setDetailModalGroup(null)}
        >
          <Pressable
            style={styles.modalSheet}
            onPress={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalDragHandle} />
              <Text style={styles.modalTitle}>Chi tiết thanh toán</Text>
              <TouchableOpacity
                onPress={() => setDetailModalGroup(null)}
                style={styles.modalCloseBtn}
              >
                <FontAwesome6
                  name="xmark"
                  size={18}
                  color="#6B7280"
                  iconStyle="solid"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.modalPersonRow}>
              {group.counterpartyAvatar ? (
                <Image
                  source={{ uri: group.counterpartyAvatar }}
                  style={styles.modalAvatar}
                />
              ) : (
                <View style={[styles.modalAvatar, styles.avatarFallback]}>
                  <Text style={styles.avatarText}>
                    {(group.counterpartyName || 'U').slice(0, 1).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.modalPersonName}>
                  {group.counterpartyName}
                </Text>
                <Text style={styles.modalPersonSub}>
                  {type === 'debt' ? 'Bạn nợ người này' : 'Người này nợ bạn'}
                </Text>
              </View>
              <Text
                style={[
                  styles.modalTotalAmount,
                  type === 'debt'
                    ? styles.debtAmountText
                    : styles.receiveAmountText,
                ]}
              >
                {type === 'debt' ? '-' : '+'}
                {formatMoney(group.totalAmount)}
              </Text>
            </View>

            <ScrollView
              style={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {tripBreakdowns.map((tripGroup, idx) => (
                <View key={idx} style={styles.tripBreakdownCard}>
                  {/* Trip name badge */}
                  <View style={styles.tripBadgeRow}>
                    <View
                      style={[
                        styles.tripBadge,
                        type === 'debt'
                          ? styles.tripBadgeDebt
                          : styles.tripBadgeReceive,
                      ]}
                    >
                      <FontAwesome6
                        name="location-dot"
                        size={11}
                        color={type === 'debt' ? '#DC2626' : '#059669'}
                        iconStyle="solid"
                      />
                      <Text
                        style={[
                          styles.tripBadgeText,
                          type === 'debt'
                            ? styles.tripBadgeTextDebt
                            : styles.tripBadgeTextReceive,
                        ]}
                      >
                        {tripGroup.tripName}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.tripBadgeTotal,
                        type === 'debt'
                          ? styles.debtAmountSmall
                          : styles.receiveAmountSmall,
                      ]}
                    >
                      {type === 'debt' ? '-' : '+'}
                      {formatMoney(tripGroup.total)}
                    </Text>
                  </View>

                  {/* Items in trip */}
                  {tripGroup.items.map((item: any, i: number) => (
                    <View key={i} style={styles.modalDetailRow}>
                      <View style={styles.modalDetailBullet} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.modalDetailDesc}>
                          {item.description}
                        </Text>
                        <Text style={styles.modalDetailDate}>
                          {formatDate(item.date)}
                        </Text>
                      </View>
                      <Text style={styles.modalDetailAmount}>
                        {formatMoney(item.amount)}
                      </Text>
                    </View>
                  ))}
                </View>
              ))}

              {/* Summary note */}
              <View style={styles.modalSummaryNote}>
                <FontAwesome6
                  name="circle-info"
                  size={13}
                  color="#6B7280"
                  iconStyle="solid"
                />
                <Text style={styles.modalSummaryText}>
                  Tổng cộng {group.items.length} khoản từ{' '}
                  {tripBreakdowns.length} chuyến đi
                </Text>
              </View>
            </ScrollView>
            <TouchableOpacity
              style={styles.modalViewDetailsBtn}
              onPress={() => {
                setDetailModalGroup(null);
                // Get all unique trip IDs from items
                const tripIds = [...new Set(group.items.map((item: any) => item.tripId))];
                if (tripIds.length > 0) {
                  navigation.navigate(SCREEN_NAME.SPENDING_DETAIL, { tripIds });
                }
              }}
            >
              <FontAwesome6
                name="receipt"
                size={14}
                color={PRIMARY_COLOR}
                iconStyle="solid"
              />
              <Text style={styles.modalViewDetailsText}>
                Xem chi tiết chia tiền chuyến đi
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    );
  };

  const renderGroupCard = (group: any, type: 'debt' | 'receivable') => {
    const primaryItem = group.items[0];
    const canConfirm = type === 'receivable' && primaryItem?.isPaid;
    const actionLoading = actionLoadingId === primaryItem?.splitId;

    const tripIds = [
      ...new Set(group.items.map((i: any) => i.tripId)),
    ] as string[];
    const tripNames = tripIds
      .map(tid => group.items.find((i: any) => i.tripId === tid)?.tripName)
      .filter(Boolean);

    return (
      <View key={group.id} style={styles.personCard}>
        <View style={styles.personHeader}>
          <View style={styles.personIdentity}>
            {group.counterpartyAvatar ? (
              <Image
                source={{ uri: group.counterpartyAvatar }}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Text style={styles.avatarText}>
                  {(group.counterpartyName || 'U').slice(0, 1).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.personMeta}>
              <Text style={styles.personName}>{group.counterpartyName}</Text>
              <Text
                style={
                  type === 'debt'
                    ? styles.debtAmountText
                    : styles.receiveAmountText
                }
              >
                {type === 'debt' ? '-' : '+'}
                {formatMoney(group.totalAmount)}
              </Text>
            </View>
          </View>
        </View>

        {/* Trip name tags */}
        <View style={styles.tripTagsRow}>
          {tripNames.map((name: string, idx: number) => (
            <View
              key={idx}
              style={[
                styles.tripTag,
                type === 'debt' ? styles.tripTagDebt : styles.tripTagReceive,
              ]}
            >
              <FontAwesome6
                name="location-dot"
                size={10}
                color={type === 'debt' ? '#DC2626' : '#059669'}
                iconStyle="solid"
              />
              <Text
                style={[
                  styles.tripTagText,
                  type === 'debt'
                    ? styles.tripTagTextDebt
                    : styles.tripTagTextReceive,
                ]}
                numberOfLines={1}
              >
                {name}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.personDescription}>
          {canConfirm
            ? `Đã gửi tiền cho bạn`
            : type === 'debt'
            ? `Đã ứng trước ${primaryItem?.description || 'tiền'}`
            : `Giao dịch: ${primaryItem?.description || 'Thanh toán'}`}
        </Text>

        <View style={styles.detailList}>
          {group.items.slice(0, 3).map((item: any) => (
            <View key={item.splitId} style={styles.detailRow}>
              <Text style={styles.detailLabel} numberOfLines={1}>
                • {item.description}
              </Text>
              <Text style={styles.detailAmount}>
                {formatMoney(item.amount)}
              </Text>
            </View>
          ))}
          {group.items.length > 3 && (
            <Text style={styles.moreItems}>
              +{group.items.length - 3} khoản khác...
            </Text>
          )}
        </View>

        <View style={styles.cardActions}>
          {type === 'debt' ? (
            <>
              <TouchableOpacity
                style={styles.primaryActionButton}
                onPress={() => handleMarkAsPaid(primaryItem.splitId)}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryActionText}>Đánh dấu đã trả</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.detailButton}
                onPress={() => setDetailModalGroup({ group, type })}
              >
                <FontAwesome6
                  name="list"
                  size={13}
                  color="#374151"
                  iconStyle="solid"
                />
                <Text style={styles.detailButtonText}>Chi tiết</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={styles.secondaryActionButton}
                onPress={() =>
                  handleRemind({
                    name: group.counterpartyName,
                    userId: group.counterpartyId || '',
                    amount: group.totalAmount,
                  })
                }
              >
                <Text style={styles.secondaryActionText}>Nhắc nhở</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.detailButton}
                onPress={() => setDetailModalGroup({ group, type })}
              >
                <FontAwesome6
                  name="list"
                  size={13}
                  color="#374151"
                  iconStyle="solid"
                />
                <Text style={styles.detailButtonText}>Chi tiết</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmActionButton,
                  !canConfirm && styles.confirmActionButtonDisabled,
                ]}
                onPress={() => handleConfirmReceived(primaryItem.splitId)}
                disabled={!canConfirm || actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator size="small" color="#063B12" />
                ) : (
                  <Text style={styles.confirmActionText}>Đã nhận</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };

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
        <Text style={styles.headerTitle}>Thanh toán & Ngân sách</Text>
        <View style={styles.headerIconWrapper}>
          <FontAwesome6
            name="chart-line"
            size={18}
            color={PRIMARY_COLOR}
            iconStyle="solid"
          />
        </View>
      </View>

      {/* Filters */}
      <PaymentFilter
        filterType={filterType}
        setFilterType={setFilterType}
        allTrips={allTrips}
        selectedTripId={selectedTripId}
        setSelectedTripId={setSelectedTripId}
        loading={loading}
      />

      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[PRIMARY_COLOR]}
          />
        }
      >
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={PRIMARY_COLOR} />
            <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
          </View>
        ) : (
          <>
            {/* Debt Section */}
            {filterType !== 'receivable' && (
              <>
                <View style={styles.sectionHeader}>
                  <View style={[styles.dot, styles.debtDot]} />
                  <Text style={styles.sectionTitle}>Bạn nợ</Text>
                  <Text style={styles.sectionDebtAmount}>
                    -{formatCompactMoney(debtTotal)}
                  </Text>
                </View>

                {filteredDebtGroups.length ? (
                  filteredDebtGroups.map((group: any) =>
                    renderGroupCard(group, 'debt'),
                  )
                ) : (
                  <View style={styles.emptyCard}>
                    <FontAwesome6
                      name="face-smile"
                      size={28}
                      color="#D1D5DB"
                      iconStyle="solid"
                    />
                    <Text style={styles.emptyText}>
                      {selectedTripId
                        ? 'Không có khoản nợ nào cho chuyến đi này.'
                        : 'Hiện tại bạn không có khoản nợ nào.'}
                    </Text>
                  </View>
                )}
              </>
            )}

            {/* Receivable Section */}
            {filterType !== 'debt' && (
              <>
                <View style={styles.sectionHeader}>
                  <View style={[styles.dot, styles.receiveDot]} />
                  <Text style={styles.sectionTitle}>Người khác nợ bạn</Text>
                  <Text style={styles.sectionReceiveAmount}>
                    +{formatCompactMoney(receivableTotal)}
                  </Text>
                </View>

                {filteredReceivableGroups.length ? (
                  filteredReceivableGroups.map((group: any) =>
                    renderGroupCard(group, 'receivable'),
                  )
                ) : (
                  <View style={styles.emptyCard}>
                    <FontAwesome6
                      name="face-smile"
                      size={28}
                      color="#D1D5DB"
                      iconStyle="solid"
                    />
                    <Text style={styles.emptyText}>
                      {selectedTripId
                        ? 'Không có khoản nhận tiền nào cho chuyến đi này.'
                        : 'Chưa có ai nợ bạn ở thời điểm này.'}
                    </Text>
                  </View>
                )}
              </>
            )}

            {!!errorText && <Text style={styles.errorText}>{errorText}</Text>}
          </>
        )}
      </ScrollView>

      {renderDetailModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
  },
  headerIconWrapper: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  container: {
    paddingHorizontal: 16,
    paddingBottom: 30,
    paddingTop: 12,
    gap: 12,
  },
  loadingWrap: {
    minHeight: 240,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
    marginBottom: 2,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  debtDot: {
    backgroundColor: '#EF4444',
  },
  receiveDot: {
    backgroundColor: '#10B981',
  },
  sectionTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  sectionDebtAmount: {
    fontSize: 17,
    fontWeight: '700',
    color: '#EF4444',
  },
  sectionReceiveAmount: {
    fontSize: 17,
    fontWeight: '700',
    color: '#10B981',
  },
  personCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  personHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  personIdentity: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarFallback: {
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  personMeta: {
    flex: 1,
  },
  personName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  personDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  debtAmountText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#EF4444',
  },
  receiveAmountText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#10B981',
  },
  debtAmountSmall: {
    color: '#EF4444',
  },
  receiveAmountSmall: {
    color: '#10B981',
  },

  // Trip tags on card
  tripTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tripTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tripTagDebt: {
    backgroundColor: '#FEF2F2',
  },
  tripTagReceive: {
    backgroundColor: '#ECFDF5',
  },
  tripTagText: {
    fontSize: 11,
    fontWeight: '600',
    maxWidth: 130,
  },
  tripTagTextDebt: {
    color: '#DC2626',
  },
  tripTagTextReceive: {
    color: '#059669',
  },

  detailList: {
    gap: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  detailLabel: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  detailAmount: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  moreItems: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  primaryActionButton: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  detailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 12,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  detailButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  secondaryActionButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  confirmActionButton: {
    flex: 1,
    backgroundColor: SECONDARY_COLOR,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmActionButtonDisabled: {
    backgroundColor: PRIMARY_COLOR,
    opacity: 0.5,
  },
  confirmActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    gap: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 13,
    color: '#DC2626',
  },

  // Detail Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 32,
    maxHeight: '85%',
  },
  modalDragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalPersonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  modalAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  modalPersonName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  modalPersonSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  modalTotalAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalScrollContent: {
    maxHeight: 420,
  },

  // Trip breakdown in modal
  tripBreakdownCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tripBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  tripBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  tripBadgeDebt: {
    backgroundColor: '#FEF2F2',
  },
  tripBadgeReceive: {
    backgroundColor: '#ECFDF5',
  },
  tripBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  tripBadgeTextDebt: {
    color: '#DC2626',
  },
  tripBadgeTextReceive: {
    color: '#059669',
  },
  tripBadgeTotal: {
    fontSize: 15,
    fontWeight: '700',
  },
  modalDetailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  modalDetailBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9CA3AF',
    marginTop: 6,
  },
  modalDetailDesc: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  modalDetailDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  modalDetailAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 'auto',
  },
  modalSummaryNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  modalSummaryText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  modalViewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: SECONDARY_COLOR,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalViewDetailsText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default PaymentDetailScreen;
