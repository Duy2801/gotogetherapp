import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  Pressable,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { useNotifications } from './useNotifications';
import { formatDate } from '../../utils/format';
import { PRIMARY_COLOR, SECONDARY_COLOR } from '../../constants/color';
import { Notification } from './api';

interface NotificationCenterProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * NotificationCenter Modal Component
 * Displays list of notifications with pagination, mark as read, and delete actions
 */
export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  visible,
  onClose,
}) => {
  const {
    notifications,
    loading,
    refreshing,
    totalNotifications,
    hasMore,
    markAsReadHandler,
    deleteHandler,
    clearAllHandler,
    onRefresh,
    loadMore,
  } = useNotifications();

  const [selectedForDelete, setSelectedForDelete] = useState<string | null>(null);

  /**
   * Handle delete with confirmation
   */
  const handleDeleteWithConfirm = (notificationId: string) => {
    Alert.alert('Xóa thông báo', 'Bạn chắc chắn muốn xóa thông báo này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => deleteHandler(notificationId),
      },
    ]);
  };

  /**
   * Handle clear all with confirmation
   */
  const handleClearAllWithConfirm = () => {
    Alert.alert(
      'Xóa tất cả',
      'Bạn chắc chắn muốn xóa tất cả thông báo? Hành động này không thể hoàn tác.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => clearAllHandler(),
        },
      ],
    );
  };

  /**
   * Render notification item
   */
  const renderNotificationItem = ({ item }: { item: Notification }) => {
    const getIcon = (type: string) => {
      const iconMap: Record<string, string> = {
        PAYMENT_MARKED: 'credit-card',
        PAYMENT_CONFIRMED: 'circle-check',
        TRIP_INVITE: 'envelope',
        MEMBER_JOINED: 'user-plus',
        INVITATION_REJECTED: 'circle-xmark',
        EXPENSE_CREATED: 'receipt',
        SETTLEMENT_REMINDER: 'bell',
      };
      return iconMap[type] || 'info-circle';
    };

    const getColor = (type: string) => {
      const colorMap: Record<string, string> = {
        PAYMENT_MARKED: '#3B82F6',
        PAYMENT_CONFIRMED: '#10B981',
        TRIP_INVITE: '#8B5CF6',
        MEMBER_JOINED: '#10B981',
        INVITATION_REJECTED: '#EF4444',
        EXPENSE_CREATED: '#F59E0B',
        SETTLEMENT_REMINDER: '#F59E0B',
      };
      return colorMap[type] || '#6B7280';
    };

    return (
      <View
        style={[
          styles.notificationItem,
          !item.isRead && styles.notificationItemUnread,
        ]}
      >
        {/* Icon */}
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: getColor(item.type) },
          ]}
        >
          <FontAwesome6
            name={getIcon(item.type)}
            size={16}
            color="#FFFFFF"
            iconStyle="solid"
          />
        </View>

        {/* Content */}
        <View style={styles.contentSection}>
          <View>
            <Text
              style={[
                styles.title,
                !item.isRead && styles.titleUnread,
              ]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text style={styles.message} numberOfLines={2}>
              {item.message}
            </Text>
          </View>
          <Text style={styles.timestamp}>
            {formatDate(item.createdAt)}
          </Text>
        </View>

        {/* Unread indicator */}
        {!item.isRead && (
          <View style={styles.unreadBadge} />
        )}

        {/* Actions */}
        <View style={styles.actions}>
          {!item.isRead && (
            <TouchableOpacity
              onPress={() => markAsReadHandler(item.id)}
              style={styles.actionButton}
            >
              <FontAwesome6
                name="check"
                size={14}
                color="#6B7280"
                iconStyle="solid"
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => handleDeleteWithConfirm(item.id)}
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
    );
  };

  /**
   * Render empty state
   */
  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <FontAwesome6
        name="bell-slash"
        size={32}
        color="#D1D5DB"
        iconStyle="solid"
      />
      <Text style={styles.emptyText}>Không có thông báo</Text>
      <Text style={styles.emptySubtext}>Tất cả thông báo sẽ xuất hiện ở đây</Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.overlay}
        onPress={onClose}
      >
        <Pressable
          style={styles.modalContent}
          onPress={e => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.dragHandle} />
            <Text style={styles.headerTitle}>Thông báo</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
            >
              <FontAwesome6
                name="xmark"
                size={18}
                color="#111827"
                iconStyle="solid"
              />
            </TouchableOpacity>
          </View>

          {/* Toolbar */}
          {notifications.length > 0 && (
            <View style={styles.toolbar}>
              <Text style={styles.toolbarText}>
                {totalNotifications} thông báo
              </Text>
              {totalNotifications > 0 && (
                <TouchableOpacity
                  onPress={handleClearAllWithConfirm}
                  style={styles.clearButton}
                >
                  <FontAwesome6
                    name="trash-can"
                    size={14}
                    color="#EF4444"
                    iconStyle="solid"
                  />
                  <Text style={styles.clearButtonText}>Xóa tất cả</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Notifications List */}
          {loading && notifications.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={PRIMARY_COLOR} />
            </View>
          ) : (
            <FlatList
              data={notifications}
              renderItem={renderNotificationItem}
              keyExtractor={item => item.id}
              ListEmptyComponent={renderEmpty}
              contentContainerStyle={styles.listContent}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[PRIMARY_COLOR]}
                />
              }
              onEndReached={hasMore ? loadMore : undefined}
              onEndReachedThreshold={0.5}
              ListFooterComponent={
                hasMore && !loading ? (
                  <View style={styles.loadMoreIndicator}>
                    <ActivityIndicator size="small" color={PRIMARY_COLOR} />
                  </View>
                ) : null
              }
            />
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingTop: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    position: 'absolute',
    top: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
  },
  toolbarText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  clearButtonText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexGrow: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    marginVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  notificationItemUnread: {
    backgroundColor: '#ECFDF5',
    borderColor: '#D1F4D1',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  contentSection: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  titleUnread: {
    fontWeight: '700',
    color: '#111827',
  },
  message: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  timestamp: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  unreadBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: PRIMARY_COLOR,
    flexShrink: 0,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    flexShrink: 0,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  emptySubtext: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  loadMoreIndicator: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});

export default NotificationCenter;
