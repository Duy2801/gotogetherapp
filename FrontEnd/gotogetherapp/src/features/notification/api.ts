import { ApiError, api } from '../../api';

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  refId?: string; // ID of the related object (expense, split, trip, etc.)
  senderId?: string; // ID of the user who sent the notification
  data?: any;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  timestamp?: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount?: number;
  total: number;
  page: number;
  pageSize: number;
}

export const notificationApi = {
  /**
   * Get user notifications with pagination
   */
  getNotifications: async (
    limit = 20,
    offset = 0,
  ): Promise<NotificationsResponse> => {
    try {
      console.log(
        `🔄 Fetching notifications: limit=${limit}, offset=${offset}`,
      );
      const response = await api.get(
        `/notification?limit=${limit}&offset=${offset}`,
      );
      const payload = (response as any)?.data ?? response;
      console.log(`✅ Notifications fetched:`, payload);
      return payload as NotificationsResponse;
    } catch (error) {
      console.error('❌ Failed to fetch notifications:', error);
      throw error as ApiError;
    }
  },

  /**
   * Mark single notification as read
   */
  markAsRead: async (notificationId: string): Promise<Notification> => {
    try {
      const response = await api.post(`/notification/${notificationId}/read`);
      return response as unknown as Notification;
    } catch (error) {
      throw error as ApiError;
    }
  },

  /**
   * Delete single notification
   */
  deleteNotification: async (
    notificationId: string,
  ): Promise<{ message: string }> => {
    try {
      const response = await api.delete(`/notification/${notificationId}`);
      return response as unknown as { message: string };
    } catch (error) {
      throw error as ApiError;
    }
  },

  /**
   * Clear all notifications
   */
  clearAllNotifications: async (): Promise<{ message: string }> => {
    try {
      const response = await api.delete('/notification');
      return response as unknown as { message: string };
    } catch (error) {
      throw error as ApiError;
    }
  },
};
