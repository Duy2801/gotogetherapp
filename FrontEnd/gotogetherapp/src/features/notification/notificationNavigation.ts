import { NavigationProp } from '@react-navigation/native';
import { SCREEN_NAME } from '../../constants/screenName';
import { Notification } from './api';

/**
 * Navigate based on notification type
 * Maps different notification types to their corresponding screens and parameters
 */
export const navigateFromNotification = (
  navigation: any,
  notification: Notification,
) => {
  const { type, refId, data, senderId } = notification;

  // Safely parse data if it's a string
  let parsedData: any = {};
  try {
    parsedData = typeof data === 'string' ? JSON.parse(data) : data || {};
  } catch (e) {
    console.warn('Failed to parse notification data:', data);
  }

  console.log(`\n🧭 [navigateFromNotification] Starting navigation:`);
  console.log(`   Type: ${type}`);
  console.log(`   RefID: ${refId}`);
  console.log(`   ParsedData:`, parsedData);
  console.log(
    `   Navigation object valid: ${navigation && !!navigation.navigate}`,
  );

  if (!navigation || !navigation.navigate) {
    console.error('❌ Navigation object invalid or missing navigate method!');
    return;
  }

  switch (type) {
    // Payment-related notifications → go to PaymentDetail screen
    case 'PAYMENT_MARKED':
    case 'PAYMENT_CONFIRMED':
    case 'SETTLEMENT_REMINDER': {
      const splitId = refId || parsedData?.splitId;
      const expenseId = parsedData?.expenseId;
      const tripId = parsedData?.tripId;

      console.log(`   💳 Payment notification - splitId: ${splitId}`);

      if (splitId) {
        console.log(`   ✅ Navigating to PAYMENT_DETAIL`);
        navigation.navigate(SCREEN_NAME.PAYMENT_DETAIL, {
          splitId,
          expenseId,
          tripId,
        });
      } else {
        console.warn('⚠️ No splitId found, navigating to Spending tab');
        navigation.navigate(SCREEN_NAME.TABS, {
          screen: SCREEN_NAME.SPENDING_TAB,
        });
      }
      break;
    }

    // Trip invitation / member joined notifications
    case 'TRIP_INVITE':
    case 'MEMBER_JOINED': {
      const tripId = refId || parsedData?.tripId;
      const expenseId = parsedData?.expenseId;

      console.log(`   🏝️  Trip notification - tripId: ${tripId}`);

      if (tripId) {
        console.log(`   ✅ Navigating to TRIP_DETAIL`);
        navigation.navigate(SCREEN_NAME.TRIP_DETAIL, {
          tripId,
          expenseId,
        });
      } else {
        console.warn('⚠️ No tripId found, navigating to Home');
        navigation.navigate(SCREEN_NAME.TABS, {
          screen: SCREEN_NAME.HOME_TAB,
        });
      }
      break;
    }

    // Expense created notifications:
    // refId can be expenseId, so prioritize tripId from payload data.
    case 'EXPENSE_CREATED': {
      const tripId = parsedData?.tripId || null;
      const expenseId = parsedData?.expenseId || refId;

      console.log(
        `   🧾 Expense notification - tripId: ${tripId}, expenseId: ${expenseId}`,
      );

      if (tripId) {
        console.log(`   ✅ Navigating to TRIP_DETAIL from EXPENSE_CREATED`);
        navigation.navigate(SCREEN_NAME.TRIP_DETAIL, {
          tripId,
          expenseId,
        });
      } else {
        console.warn(
          '⚠️ Missing tripId for EXPENSE_CREATED, fallback to Spending',
        );
        navigation.navigate(SCREEN_NAME.TABS, {
          screen: SCREEN_NAME.SPENDING_TAB,
        });
      }
      break;
    }

    // Rejection notifications - navigate to Spending
    case 'INVITATION_REJECTED': {
      console.log(`   ❌ Invitation rejected - navigating to Spending`);
      navigation.navigate(SCREEN_NAME.TABS, {
        screen: SCREEN_NAME.SPENDING_TAB,
      });
      break;
    }

    default:
      console.warn(`⚠️ Unknown notification type: ${type}`);
      // Default fallback to Spending tab
      navigation.navigate(SCREEN_NAME.TABS, {
        screen: SCREEN_NAME.SPENDING_TAB,
      });
  }
};

/**
 * Get descriptive action text for notification types
 */
export const getNotificationActionText = (type: string): string => {
  const actionMap: Record<string, string> = {
    PAYMENT_MARKED: 'Xem chi tiết thanh toán',
    PAYMENT_CONFIRMED: 'Xem chi tiết thanh toán',
    TRIP_INVITE: 'Xem thông tin chuyến đi',
    MEMBER_JOINED: 'Xem thành viên chuyến đi',
    INVITATION_REJECTED: 'Xem chi tiết',
    EXPENSE_CREATED: 'Xem chi tiết chi phí',
    SETTLEMENT_REMINDER: 'Thanh toán ngay',
  };
  return actionMap[type] || 'Xem chi tiết';
};
