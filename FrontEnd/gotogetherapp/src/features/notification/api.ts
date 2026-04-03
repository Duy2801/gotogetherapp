import { ApiError, api } from '../../api';

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
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
      console.log(`🔄 Fetching notifications: limit=${limit}, offset=${offset}`);
      const response = await api.get(
        `/notification?limit=${limit}&offset=${offset}`,
      );
      console.log(`✅ Notifications fetched:`, response);
      return response as unknown as NotificationsResponse;
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
