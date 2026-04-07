import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  refId?: string;
  senderId?: string;
  data?: any;
  timestamp: string; // Use ISO string instead of Date object
  isRead: boolean;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
      // Keep only last 50 notifications
      if (state.notifications.length > 50) {
        state.notifications.pop();
      }
    },

    addSocketNotification: (state, action: PayloadAction<any>) => {
      const notification: Notification = {
        id: action.payload.id || `socket-${Date.now()}`,
        type: action.payload.type,
        title: action.payload.title,
        message: action.payload.message,
        refId: action.payload.refId,
        senderId: action.payload.senderId,
        data: action.payload.data,
        timestamp: action.payload.timestamp || new Date().toISOString(),
        isRead: false,
      };
      state.notifications.unshift(notification);
      state.unreadCount += 1;
      // Keep only last 50 notifications
      if (state.notifications.length > 50) {
        state.notifications.pop();
      }
    },

    hydrateNotifications: (
      state,
      action: PayloadAction<{
        notifications: Notification[];
        unreadCount: number;
      }>,
    ) => {
      state.notifications = action.payload.notifications.slice(0, 50);
      state.unreadCount = action.payload.unreadCount;
    },

    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(
        n => n.id === action.payload,
      );
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },

    markAllAsRead: state => {
      state.notifications.forEach(n => {
        n.isRead = true;
      });
      state.unreadCount = 0;
    },

    removeNotification: (state, action: PayloadAction<string>) => {
      const index = state.notifications.findIndex(n => n.id === action.payload);
      if (index > -1) {
        if (!state.notifications[index].isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications.splice(index, 1);
      }
    },

    clearAllNotifications: state => {
      state.notifications = [];
      state.unreadCount = 0;
    },
  },
});

export const {
  addNotification,
  addSocketNotification,
  hydrateNotifications,
  markAsRead,
  markAllAsRead,
  removeNotification,
  clearAllNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;
