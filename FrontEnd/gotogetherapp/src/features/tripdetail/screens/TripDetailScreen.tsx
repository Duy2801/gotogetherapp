import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  Pressable,
  Image,
} from 'react-native';
import { useSelector } from 'react-redux';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { PRIMARY_COLOR, SECONDARY_COLOR } from '../../../constants/color';
import { SCREEN_NAME } from '../../../constants/screenName';
import Body from '../../../components/Layout/Body';
import MemberSection from '../components/MemberSection';
import ExpenseItem from '../components/ExpenseItem';
import AddMemberModal from '../components/AddMemberModal';
import { tripDetailApi, TripDetail, Expense, Member } from '../api';
import SimpleFloatingButton from '../../../components/SimpleFloatingButton';
import { RootState } from '../../../reducers/store';
import { useSocket } from '../../../services/useSocket';

interface TripDetailScreenProps {
  route: any;
  navigation: any;
}

const TripDetailScreen: React.FC<TripDetailScreenProps> = ({
  route,
  navigation,
}) => {
  const { tripId } = route.params;
  const currentUser = useSelector((state: RootState) => state.login.user);
  const { socket } = useSocket();

  const [tripDetail, setTripDetail] = useState<TripDetail | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showExpensesModal, setShowExpensesModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [loadingAllExpenses, setLoadingAllExpenses] = useState(false);
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);

  const fetchTripDetail = async () => {
    try {
      const tripResponse = await tripDetailApi.getTripDetail(tripId);

      if (tripResponse.status) {
        setTripDetail(tripResponse.data);
      }
      try {
        const expensesResponse = await tripDetailApi.getTripExpenses(tripId, {
          limit: 20,
        });
        if (expensesResponse.status) {
          setExpenses(expensesResponse.data.expenses);
        }
      } catch (expenseError: any) {}
    } catch (error: any) {
      Alert.alert('Lỗi', error?.error || 'Không thể tải thông tin chuyến đi');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTripDetail();
  }, [tripId]);

  // Join and leave trip room for socket events
  useEffect(() => {
    if (!socket || !tripId) {
      console.warn('⚠️ Socket or tripId not available', { socket: !!socket, tripId });
      return;
    }

    if (!socket.connected) {
      const waitForConnect = setTimeout(() => {
        if (socket.connected) {
          socket.emit('join:trip', tripId);
          console.log('✓ Joined trip room (after reconnect):', tripId);
        }
      }, 1000);
      return () => clearTimeout(waitForConnect);
    }

    socket.emit('join:trip', tripId);
    return () => {
      socket.emit('leave:trip', tripId);
      console.log('✗ Left trip room:', tripId);
    };
  }, [socket, tripId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTripDetail();
  }, [tripId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
    });
  };

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
  };
  const calculateTotalExpense = () => {
    return expenses.reduce(
      (total, expense) => total + Number(expense.amount),
      0,
    );
  };

  const totalExpense = calculateTotalExpense();
  const estimatedBudget = Number(tripDetail?.totalBudget || 0);
  const hasEstimatedBudget = estimatedBudget > 0;
  const spentRatio = hasEstimatedBudget ? totalExpense / estimatedBudget : 0;
  const spentPercent = Math.round(spentRatio * 100);
  const progressWidth: `${number}%` = `${Math.min(spentRatio, 1) * 100}%`;
  const isOverBudget = hasEstimatedBudget && totalExpense > estimatedBudget;
  const exceedAmount = isOverBudget ? totalExpense - estimatedBudget : 0;
  const remainingAmount = hasEstimatedBudget
    ? Math.max(estimatedBudget - totalExpense, 0)
    : 0;
  const remainingPercent = hasEstimatedBudget
    ? Math.max(100 - spentPercent, 0)
    : 0;

  const acceptedMembers =
    tripDetail?.members?.filter(member => member.inviteStatus === 'ACCEPTED') ||
    [];

  const currentMember =
    acceptedMembers.find(member => member.userId === currentUser?.id) || null;
  const isCurrentUserOwner = currentMember?.role === 'OWNER';

  const transferableMembers = useMemo(
    () =>
      acceptedMembers.filter(
        member => member.userId !== currentUser?.id && member.role !== 'OWNER',
      ),
    [acceptedMembers, currentUser?.id],
  );

  const ownerMember =
    tripDetail?.members?.find(
      member => member.role === 'OWNER' && member.inviteStatus === 'ACCEPTED',
    ) || null;

  const handleAddExpense = () => {
    navigation.navigate(SCREEN_NAME.ADD_EXPENSE, {
      tripId,
      onExpenseAdded: () => {
        fetchTripDetail();
      },
    });
  };

  const handleInviteMember = async (email: string) => {
    try {
      console.log('Inviting member:', email, 'to trip:', tripId);
      const response = await tripDetailApi.inviteMember(tripId, { email });
      console.log('Invite response:', response);

      if (response.status) {
        Alert.alert(
          'Thành công',
          `Đã gửi lời mời đến ${email}. Họ cần chấp nhận lời mời để tham gia chuyến đi.`,
        );
        fetchTripDetail();
      }
    } catch (error: any) {
      console.error('Error inviting member:', error);
      const errorMessage =
        error?.message || error?.error || 'Không thể mời thành viên';

      if (errorMessage.includes('chi tiêu')) {
        Alert.alert(
          'Không thể thêm thành viên',
          'Không thể thêm thành viên khi đã có chi tiêu trong chuyến đi.',
        );
      } else if (
        errorMessage.includes('email') ||
        errorMessage.includes('người dùng')
      ) {
        Alert.alert(
          'Không tìm thấy',
          'Không tìm thấy người dùng với email này. Vui lòng kiểm tra lại.',
        );
      } else if (errorMessage.includes('đã là thành viên')) {
        Alert.alert('Thông báo', 'Người dùng đã là thành viên của chuyến đi.');
      } else if (errorMessage.includes('lời mời đã được gửi')) {
        Alert.alert('Thông báo', 'Lời mời đã được gửi trước đó.');
      } else if (
        errorMessage.includes('không thuộc chuyến đi') ||
        errorMessage.includes('không có quyền')
      ) {
        Alert.alert(
          'Lỗi',
          'Bạn không có quyền mời thành viên vào chuyến đi này. Chỉ chủ chuyến đi mới có quyền này.',
        );
      } else {
        Alert.alert('Lỗi', errorMessage);
      }

      throw error;
    }
  };

  const handleLeaveTrip = async () => {
    Alert.alert('Rời nhóm', 'Bạn chắc chắn muốn rời khỏi chuyến đi này?', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Rời nhóm',
        style: 'destructive',
        onPress: async () => {
          try {
            setActionLoading(true);
            await tripDetailApi.leaveTrip(tripId);
            setShowActionModal(false);
            Alert.alert('Thành công', 'Bạn đã rời khỏi chuyến đi.');
            navigation.goBack();
          } catch (error: any) {
            Alert.alert(
              'Không thể rời nhóm',
              error?.error ||
                error?.message ||
                'Đã có lỗi xảy ra khi rời chuyến đi.',
            );
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  const handleOpenTransferOwner = () => {
    if (!isCurrentUserOwner) {
      Alert.alert('Thông báo', 'Chỉ chủ chuyến đi mới có thể chuyển quyền.');
      return;
    }
    if (!transferableMembers.length) {
      Alert.alert('Thông báo', 'Không có thành viên phù hợp để chuyển quyền.');
      return;
    }
    setShowActionModal(false);
    setShowTransferModal(true);
  };

  const handleTransferOwner = async (member: Member) => {
    Alert.alert(
      'Chuyển quyền chủ chuyến',
      `Bạn muốn chuyển quyền chủ chuyến cho ${member.fullName}?`,
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: async () => {
            try {
              setActionLoading(true);
              await tripDetailApi.transferOwner(tripId, member.userId);
              setShowTransferModal(false);
              await fetchTripDetail();
              Alert.alert(
                'Thành công',
                `Đã chuyển quyền chủ chuyến cho ${member.fullName}.`,
              );
            } catch (error: any) {
              Alert.alert(
                'Không thể chuyển quyền',
                error?.error ||
                  error?.message ||
                  'Đã có lỗi xảy ra khi chuyển quyền.',
              );
            } finally {
              setActionLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleOpenAllExpenses = async () => {
    setShowExpensesModal(true);
    setLoadingAllExpenses(true);
    try {
      const response = await tripDetailApi.getTripExpenses(tripId, {
        page: 1,
        limit: 200,
      });
      if (response.status) {
        setAllExpenses(response.data.expenses || []);
      }
    } catch (error: any) {
      setAllExpenses(expenses);
      Alert.alert(
        'Thông báo',
        error?.error || error?.message || 'Không thể tải toàn bộ chi tiêu.',
      );
    } finally {
      setLoadingAllExpenses(false);
    }
  };

  if (loading) {
    return (
      <Body
        hideHeader={false}
        title="Chi tiết chuyến đi"
        backgroundColor="#f0f5f1"
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </Body>
    );
  }

  if (!tripDetail) {
    return (
      <Body
        hideHeader={false}
        title="Chi tiết chuyến đi"
        backgroundColor="#f0f5f1"
      >
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Không tìm thấy thông tin chuyến đi
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchTripDetail}
          >
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </Body>
    );
  }

  return (
    <Body hideHeader backgroundColor="#E5ECE7">
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => navigation.goBack()}
          >
            <FontAwesome6
              name="angle-left"
              size={18}
              color="#23303D"
              iconStyle="solid"
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {tripDetail.name}
          </Text>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => setShowActionModal(true)}
          >
            <FontAwesome6
              name="ellipsis-vertical"
              size={16}
              color="#23303D"
              iconStyle="solid"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.tripInformation}>
          <View style={styles.profileRow}>
            {tripDetail.images ? (
              <Image
                source={{ uri: tripDetail.images }}
                style={styles.tripThumb}
              />
            ) : (
              <View style={[styles.tripThumb, styles.tripThumbFallback]}>
                <FontAwesome6
                  name="mountain-sun"
                  size={28}
                  color="#84A694"
                  iconStyle="solid"
                />
              </View>
            )}

            <View style={styles.profileInfo}>
              <View style={styles.ownerBadge}>
                <FontAwesome6
                  name="user-tie"
                  size={10}
                  color="#25B55F"
                  iconStyle="solid"
                />
                <Text style={styles.ownerBadgeText}>Chủ chuyến đi</Text>
              </View>

              <Text style={styles.ownerName} numberOfLines={1}>
                {ownerMember?.fullName || 'Thành viên'}
              </Text>

              <View style={styles.tripMetaRow}>
                <View style={styles.tripDateChip}>
                  <FontAwesome6
                    name="calendar"
                    size={11}
                    color="#6B7280"
                    iconStyle="solid"
                  />
                  <Text style={styles.tripDateText}>
                    {formatDate(tripDetail.startDate)} -{' '}
                    {formatDate(tripDetail.endDate)}
                  </Text>
                </View>

                <View style={styles.dayChip}>
                  <FontAwesome6
                    name="circle-check"
                    size={10}
                    color="#1FB45C"
                    iconStyle="solid"
                  />
                  <Text style={styles.dayChipText}>
                    {calculateDays(tripDetail.startDate, tripDetail.endDate)}{' '}
                    ngày
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {acceptedMembers.length > 0 && (
            <MemberSection
              members={acceptedMembers}
              onAddMember={() => {
                if (isCurrentUserOwner) {
                  setShowAddMemberModal(true);
                  return;
                }
                Alert.alert(
                  'Thông báo',
                  'Chỉ chủ chuyến đi mới có thể mời thành viên mới.',
                );
              }}
              onViewAll={() => {
                setShowMembersModal(true);
              }}
            />
          )}
        </View>

        <View style={styles.budgetCard}>
          <View style={styles.budgetHeaderRow}>
            <Text style={styles.budgetHeaderLabel}>TÌNH TRẠNG NGÂN SÁCH</Text>
            <View style={styles.budgetHeaderIconWrap}>
              <FontAwesome6
                name="wallet"
                size={11}
                color="#22C55E"
                iconStyle="solid"
              />
            </View>
          </View>

          <Text style={styles.budgetMainValue}>
            {hasEstimatedBudget
              ? `${remainingAmount.toLocaleString('vi-VN')}đ`
              : '0đ'}
          </Text>

          <View style={styles.budgetStatusRow}>
            <Text
              style={[
                styles.budgetStatusText,
                isOverBudget && styles.budgetStatusTextOver,
              ]}
            >
              {hasEstimatedBudget
                ? isOverBudget
                  ? `Vượt mức ${exceedAmount.toLocaleString('vi-VN')}đ`
                  : `Còn lại (${remainingPercent}%)`
                : 'Chưa thiết lập ngân sách'}
            </Text>
          </View>

          <View style={styles.budgetProgressTrack}>
            <View
              style={[
                styles.budgetProgressFill,
                isOverBudget
                  ? styles.budgetProgressFillOver
                  : styles.budgetProgressFillNormal,
                { width: progressWidth },
              ]}
            />
          </View>

          <View style={styles.budgetSummaryRow}>
            <View>
              <Text style={styles.budgetSummaryLabel}>DỰ TÍNH</Text>
              <Text style={styles.budgetSummaryValue}>
                {hasEstimatedBudget
                  ? estimatedBudget.toLocaleString('vi-VN')
                  : '0'}
                đ
              </Text>
            </View>
            <View style={styles.summaryRightCol}>
              <Text style={styles.budgetSummaryLabel}>ĐÃ CHI</Text>
              <Text style={styles.budgetSpentValue}>
                {totalExpense.toLocaleString('vi-VN')}đ
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.expensesContainer}>
          <View style={styles.expenseHeaderRow}>
            <Text style={styles.expenseTitle}>Chi tiêu gần đây</Text>
            <TouchableOpacity onPress={handleOpenAllExpenses}>
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          {expenses.length > 0 ? (
            <View style={styles.expensesList}>
              {expenses.map(expense => (
                <ExpenseItem key={expense.id} expense={expense} />
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Chưa có chi tiêu nào</Text>
              <Text style={styles.emptySubText}>
                Nhấn nút + để thêm chi tiêu mới
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal
        visible={showMembersModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMembersModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setShowMembersModal(false)}
          />
          <View style={styles.transferCard}>
            <Text style={styles.actionTitle}>Tất cả thành viên</Text>

            <ScrollView
              style={styles.allListWrap}
              showsVerticalScrollIndicator={false}
            >
              {acceptedMembers.map(member => (
                <View key={member.id} style={styles.memberListItem}>
                  <View style={styles.memberIdentityWrap}>
                    {member.avatar ? (
                      <Image
                        source={{ uri: member.avatar }}
                        style={styles.transferAvatar}
                      />
                    ) : (
                      <View
                        style={[
                          styles.transferAvatar,
                          styles.transferAvatarFallback,
                        ]}
                      >
                        <Text style={styles.transferAvatarText}>
                          {(member.fullName || 'U').slice(0, 1).toUpperCase()}
                        </Text>
                      </View>
                    )}
                    <Text style={styles.transferName}>{member.fullName}</Text>
                  </View>
                  <Text style={styles.memberRoleBadge}>
                    {member.role === 'OWNER' ? 'Chủ chuyến' : 'Thành viên'}
                  </Text>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.actionCancelBtn}
              onPress={() => setShowMembersModal(false)}
            >
              <Text style={styles.actionCancelText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showExpensesModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowExpensesModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setShowExpensesModal(false)}
          />
          <View style={styles.expensesModalCard}>
            <Text style={styles.actionTitle}>Tất cả chi tiêu</Text>

            {loadingAllExpenses ? (
              <View style={styles.modalLoadingWrap}>
                <ActivityIndicator size="small" color={PRIMARY_COLOR} />
                <Text style={styles.modalLoadingText}>Đang tải dữ liệu...</Text>
              </View>
            ) : (
              <ScrollView
                style={styles.allListWrap}
                showsVerticalScrollIndicator={false}
              >
                {(allExpenses.length ? allExpenses : expenses).map(expense => (
                  <ExpenseItem key={`modal-${expense.id}`} expense={expense} />
                ))}

                {!allExpenses.length && !expenses.length && (
                  <Text style={styles.emptyTransferText}>
                    Chưa có chi tiêu nào.
                  </Text>
                )}
              </ScrollView>
            )}

            <TouchableOpacity
              style={styles.actionCancelBtn}
              onPress={() => setShowExpensesModal(false)}
            >
              <Text style={styles.actionCancelText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showActionModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowActionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setShowActionModal(false)}
          />
          <View style={styles.actionCard}>
            <Text style={styles.actionTitle}>Quản lý chuyến đi</Text>

            {isCurrentUserOwner && (
              <TouchableOpacity
                style={styles.actionItem}
                onPress={handleOpenTransferOwner}
                disabled={actionLoading}
              >
                <FontAwesome6
                  name="crown"
                  size={13}
                  color="#E59E0B"
                  iconStyle="solid"
                />
                <Text style={styles.actionItemText}>
                  Chuyển quyền chủ chuyến
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.actionItem}
              onPress={handleLeaveTrip}
              disabled={actionLoading}
            >
              <FontAwesome6
                name="right-from-bracket"
                size={13}
                color="#DC2626"
                iconStyle="solid"
              />
              <Text style={[styles.actionItemText, styles.actionDangerText]}>
                Rời nhóm
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCancelBtn}
              onPress={() => setShowActionModal(false)}
            >
              <Text style={styles.actionCancelText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showTransferModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTransferModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setShowTransferModal(false)}
          />
          <View style={styles.transferCard}>
            <Text style={styles.actionTitle}>Chọn thành viên nhận quyền</Text>

            {transferableMembers.map(member => (
              <TouchableOpacity
                key={member.id}
                style={styles.transferItem}
                onPress={() => handleTransferOwner(member)}
                disabled={actionLoading}
              >
                {member.avatar ? (
                  <Image
                    source={{ uri: member.avatar }}
                    style={styles.transferAvatar}
                  />
                ) : (
                  <View
                    style={[
                      styles.transferAvatar,
                      styles.transferAvatarFallback,
                    ]}
                  >
                    <Text style={styles.transferAvatarText}>
                      {(member.fullName || 'U').slice(0, 1).toUpperCase()}
                    </Text>
                  </View>
                )}
                <Text style={styles.transferName}>{member.fullName}</Text>
              </TouchableOpacity>
            ))}

            {!transferableMembers.length && (
              <Text style={styles.emptyTransferText}>
                Không có thành viên phù hợp để chuyển quyền.
              </Text>
            )}

            <TouchableOpacity
              style={styles.actionCancelBtn}
              onPress={() => setShowTransferModal(false)}
            >
              <Text style={styles.actionCancelText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <AddMemberModal
        visible={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
        onSubmit={handleInviteMember}
      />
      <SimpleFloatingButton
        onPress={handleAddExpense}
        icon="+"
        backgroundColor={SECONDARY_COLOR}
        size={56}
        bottom={20}
        right={20}
        position="right"
      />
    </Body>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
    fontSize: 30,
    fontWeight: '700',
    color: '#111827',
  },
  tripInformation: {
    marginBottom: 16,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tripThumb: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: '#D8E3DB',
    borderWidth: 1,
    borderColor: '#D2DDD5',
  },
  tripThumbFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  ownerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  ownerBadgeText: {
    fontSize: 12,
    color: '#6F8091',
    fontWeight: '700',
  },
  ownerName: {
    fontSize: 16,
    color: '#18212B',
    fontWeight: '700',
    marginBottom: 8,
  },
  tripMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tripDateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 10,
    backgroundColor: '#E5EBEF',
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  tripDateText: {
    fontSize: 13,
    color: '#425466',
    fontWeight: '600',
  },
  dayChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 6,
    backgroundColor: '#DDF7E6',
  },
  dayChipText: {
    color: '#20A560',
    fontSize: 12,
    fontWeight: '700',
  },
  budgetCard: {
    backgroundColor: '#0B1736',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  budgetHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  budgetHeaderLabel: {
    color: '#93A3CB',
    fontSize: 12,
    letterSpacing: 0.4,
    fontWeight: '700',
  },
  budgetHeaderIconWrap: {
    width: 20,
    height: 20,
    borderRadius: 5,
    backgroundColor: '#0F274A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  budgetMainValue: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  budgetStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  budgetStatusText: {
    color: '#2BEB87',
    fontSize: 13,
    fontWeight: '700',
  },
  budgetStatusTextOver: {
    color: '#F87171',
  },
  budgetProgressTrack: {
    width: '100%',
    height: 9,
    borderRadius: 999,
    backgroundColor: '#20314F',
    overflow: 'hidden',
    marginBottom: 12,
  },
  budgetProgressFill: {
    height: '100%',
    borderRadius: 999,
  },
  budgetProgressFillNormal: {
    backgroundColor: '#00D470',
  },
  budgetProgressFillOver: {
    backgroundColor: '#EF4444',
  },
  budgetSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  budgetSummaryLabel: {
    color: '#7D8AAF',
    fontSize: 10,
    fontWeight: '700',
  },
  budgetSummaryValue: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  summaryRightCol: {
    alignItems: 'flex-end',
  },
  budgetSpentValue: {
    color: '#FB7185',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  expensesContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 20,
    minHeight: 380,
  },
  expenseHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  expenseTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#161C2A',
  },
  seeAllText: {
    fontSize: 12,
    color: '#1FB45C',
    fontWeight: '700',
  },
  expensesList: {
    paddingTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#BBB',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  actionCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
  },
  actionItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  actionDangerText: {
    color: '#B91C1C',
  },
  actionCancelBtn: {
    marginTop: 6,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#EDF2F7',
  },
  actionCancelText: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '700',
  },
  transferCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    gap: 8,
    maxHeight: '70%',
  },
  expensesModalCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    gap: 8,
    maxHeight: '78%',
  },
  allListWrap: {
    maxHeight: 380,
  },
  modalLoadingWrap: {
    paddingVertical: 22,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  modalLoadingText: {
    color: '#64748B',
    fontSize: 13,
  },
  memberListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  memberIdentityWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  memberRoleBadge: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '600',
  },
  transferItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
  },
  transferAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  transferAvatarFallback: {
    backgroundColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  transferAvatarText: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 13,
  },
  transferName: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
  },
  emptyTransferText: {
    color: '#64748B',
    fontSize: 13,
    marginTop: 4,
  },
});

export default TripDetailScreen;
