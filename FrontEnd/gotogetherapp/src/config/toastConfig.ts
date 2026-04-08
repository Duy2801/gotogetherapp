/**
 * Toast notification configuration
 * Maps notification types to display styling
 */

export interface ToastStyleConfig {
  backgroundColor: string;
  icon: string;
  toastAssetKey: string;
  duration: number;
}

export const TOAST_CONFIG: Record<string, ToastStyleConfig> = {
  // Payment events
  PAYMENT_MARKED: {
    backgroundColor: '#3B82F6', // Blue
    icon: 'credit-card',
    toastAssetKey: 'PAYMENT',
    duration: 3000,
  },
  PAYMENT_CONFIRMED: {
    backgroundColor: '#10B981', // Green
    icon: 'circle-check',
    toastAssetKey: 'PAYMENT_CONFIRMED',
    duration: 4000,
  },

  // Trip/Member events
  TRIP_INVITE: {
    backgroundColor: '#8B5CF6', // Purple
    icon: 'envelope',
    toastAssetKey: 'TRIP_INVITE',
    duration: 5000,
  },
  MEMBER_JOINED: {
    backgroundColor: '#10B981', // Green
    icon: 'user-plus',
    toastAssetKey: 'MEMBER_JOINED',
    duration: 3000,
  },
  INVITATION_REJECTED: {
    backgroundColor: '#EF4444', // Red
    icon: 'circle-xmark',
    toastAssetKey: 'INVITE_REJECTED',
    duration: 3000,
  },

  // Expense & Settlement events
  EXPENSE_CREATED: {
    backgroundColor: '#F59E0B', // Orange
    icon: 'receipt',
    toastAssetKey: 'CREATE_EXPENSE',
    duration: 3000,
  },
  SETTLEMENT_REMINDER: {
    backgroundColor: '#F59E0B', // Orange
    icon: 'bell',
    toastAssetKey: 'SETTLEMENT_REMINDER',
    duration: 5000,
  },

  // Default fallback
  DEFAULT: {
    backgroundColor: '#6B7280', // Gray
    icon: 'info-circle',
    toastAssetKey: 'DEFAULT',
    duration: 3000,
  },
};

/**
 * Get toast config for a notification type
 * Falls back to DEFAULT if type not found
 */
export const getToastConfig = (type: string): ToastStyleConfig => {
  return TOAST_CONFIG[type] || TOAST_CONFIG.DEFAULT;
};
