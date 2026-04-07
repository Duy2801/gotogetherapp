import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../reducers/store';
import {
  hydrateNotifications,
  markAsRead,
  removeNotification,
} from '../../reducers/notificationSlice';
import { notificationApi, Notification } from './api';

interface UseNotificationsReturn {
  notifications: Notification[];
  loading: boolean;
  refreshing: boolean;
  totalNotifications: number;
  currentPage: number;
  pageSize: number;
  hasMore: boolean;
  fetchNotifications: (page?: number) => Promise<void>;
  onRefresh: () => Promise<void>;
  markAsReadHandler: (notificationId: string) => Promise<void>;
  deleteHandler: (notificationId: string) => Promise<void>;
  clearAllHandler: () => Promise<void>;
  loadMore: () => Promise<void>;
}

/**
 * Custom hook for managing notifications list
 * Handles fetching, pagination, marking as read, and deleting
 */
export const useNotifications = (pageSize = 20): UseNotificationsReturn => {
  const dispatch = useDispatch();
  const unreadCount = useSelector(
    (state: RootState) => state.notification?.unreadCount || 0,
  );

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [prevUnreadCount, setPrevUnreadCount] = useState(unreadCount);

  const offset = (currentPage - 1) * pageSize;

  const normalizeNotifications = (items: any[] | undefined | null) => {
    if (!Array.isArray(items)) return [];

    return items.map(item => ({
      ...item,
      createdAt: item.createdAt || item.timestamp || new Date().toISOString(),
      timestamp: item.timestamp || item.createdAt || new Date().toISOString(),
      isRead: Boolean(item.isRead),
      refId: item.refId, // Ensure refId is preserved
      senderId: item.senderId, // Ensure senderId is preserved
    }));
  };

  /**
   * Fetch notifications from API
   */
  const fetchNotifications = useCallback(
    async (page = 1) => {
      try {
        console.log(`🔍 [useNotifications] Fetching page ${page}...`);
        setLoading(true);
        const offset = (page - 1) * pageSize;
        const result = await notificationApi.getNotifications(pageSize, offset);
        const apiNotifications = normalizeNotifications(
          (result as any)?.notifications,
        );

        console.log(`✅ [useNotifications] Page ${page} fetched:`, {
          ...result,
          notifications: apiNotifications,
        });

        if (page === 1) {
          setNotifications(apiNotifications);
          dispatch(
            hydrateNotifications({
              notifications: apiNotifications,
              unreadCount:
                (result as any)?.unreadCount ??
                apiNotifications.filter(notification => !notification.isRead)
                  .length,
            }),
          );
        } else {
          setNotifications(prev => [...prev, ...apiNotifications]);
        }

        const totalCount = (result as any)?.total ?? apiNotifications.length;
        setTotalNotifications(totalCount);
        setCurrentPage(page);

        const totalPages = Math.ceil(totalCount / pageSize);
        setHasMore(page < totalPages);
      } catch (error) {
        console.error(
          '❌ [useNotifications] Failed to fetch notifications:',
          error,
        );
      } finally {
        setLoading(false);
      }
    },
    [pageSize, dispatch],
  );

  /**
   * Refresh notifications
   */
  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await fetchNotifications(1);
    } finally {
      setRefreshing(false);
    }
  }, [fetchNotifications]);

  /**
   * Mark notification as read
   */
  const markAsReadHandler = useCallback(
    async (notificationId: string) => {
      try {
        await notificationApi.markAsRead(notificationId);

        // Update local state
        setNotifications(prev =>
          prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n)),
        );

        // Update Redux
        dispatch(markAsRead(notificationId));
      } catch (error) {
        console.error('Failed to mark as read:', error);
      }
    },
    [dispatch],
  );

  /**
   * Delete single notification
   */
  const deleteHandler = useCallback(
    async (notificationId: string) => {
      try {
        await notificationApi.deleteNotification(notificationId);

        // Update local state
        const updatedNotifications = notifications.filter(
          n => n.id !== notificationId,
        );
        setNotifications(updatedNotifications);
        setTotalNotifications(prev => prev - 1);

        // Update Redux
        dispatch(removeNotification(notificationId));
      } catch (error) {
        console.error('Failed to delete notification:', error);
      }
    },
    [notifications, dispatch],
  );

  /**
   * Clear all notifications
   */
  const clearAllHandler = useCallback(async () => {
    try {
      await notificationApi.clearAllNotifications();

      // Update local state
      setNotifications([]);
      setTotalNotifications(0);
      setCurrentPage(1);
      setHasMore(false);
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  }, []);

  /**
   * Load more notifications (pagination)
   */
  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    await fetchNotifications(currentPage + 1);
  }, [hasMore, loading, currentPage, fetchNotifications]);

  // Fetch notifications on mount
  useEffect(() => {
    const loadInitialNotifications = async () => {
      try {
        await fetchNotifications(1);
      } catch (error) {
        console.error('Failed to load initial notifications:', error);
      }
    };
    loadInitialNotifications();
  }, [fetchNotifications]);

  // Refetch when new socket notifications arrive (unreadCount increases)
  useEffect(() => {
    console.log(
      `[useNotifications] unreadCount: ${unreadCount}, prevUnreadCount: ${prevUnreadCount}`,
    );
    if (unreadCount > prevUnreadCount) {
      console.log(
        `📨 New notification detected! Unread: ${unreadCount} > ${prevUnreadCount}. Refetching...`,
      );
      fetchNotifications(1);
      setPrevUnreadCount(unreadCount);
    }
  }, [unreadCount, prevUnreadCount, fetchNotifications]);

  return {
    notifications,
    loading,
    refreshing,
    totalNotifications,
    currentPage,
    pageSize,
    hasMore,
    fetchNotifications,
    onRefresh,
    markAsReadHandler,
    deleteHandler,
    clearAllHandler,
    loadMore,
  };
};
