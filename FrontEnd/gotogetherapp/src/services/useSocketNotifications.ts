import { useEffect } from 'react';
import React from 'react';
import { useDispatch } from 'react-redux';
import { useSocket } from './useSocket';
import { addSocketNotification } from '../reducers/notificationSlice';

/**
 * Hook to set up socket event listeners for notifications
 * Listens for real-time notifications and updates Redux store
 * This hook should be called in a component that's always mounted (e.g., Layout or App)
 */
export const useSocketNotifications = () => {
  const { socket, isConnected } = useSocket();
  const dispatch = useDispatch();
  const listenersSetupRef = React.useRef(false);

  useEffect(() => {
    if (!socket) {
      console.warn('⚠️ Socket not available in useSocketNotifications');
      listenersSetupRef.current = false;
      return;
    }

    // Only setup listeners once when socket becomes connected
    if (!socket.connected) {
      console.warn(
        '⚠️ Socket exists but not connected. Will setup when connected...',
      );
      console.log('   Socket ID:', socket.id);
      return;
    }

    // If listeners already setup, don't setup again
    if (listenersSetupRef.current) {
      console.log('✓ Socket listeners already setup');
      return;
    }

    console.log(
      '🔊 [useSocketNotifications] Socket connected! Setting up listeners...',
    );
    console.log('   Socket ID:', socket.id);
    console.log('   Connected rooms:', (socket as any).rooms || []);

    // Listen for reminder notifications
    const handleReminder = (data: any) => {
      console.log('📢 [REMINDER EVENT RECEIVED] Data:', data);
      try {
        dispatch(
          addSocketNotification({
            id: data.id || `reminder-${Date.now()}`,
            type: 'SETTLEMENT_REMINDER',
            title: data.title || 'Nhắc nhở thanh toán',
            message: data.message,
            refId: data.refId, // Include refId so navigation knows which payment to show
            senderId: data.senderId, // Include sender ID
            data: {
              amount: data.amount,
              fromUserName: data.fromUserName,
              splitId: data.refId, // Also include in data for reference
            },
            timestamp: data.timestamp || new Date().toISOString(),
          }),
        );
        console.log('✅ [REMINDER DISPATCHED] Redux state updated!');
      } catch (error) {
        console.error('❌ Error handling reminder:', error);
      }
    };

    // Listen for payment marked notifications
    const handlePaymentMarked = (data: any) => {
      console.log('💳 Payment marked notification received:', data);
      dispatch(
        addSocketNotification({
          id: data.id || `payment-marked-${Date.now()}`,
          type: 'PAYMENT_MARKED',
          title: data.title || 'Thanh toán được đánh dấu',
          message: data.message,
          refId: data.splitId || data.refId,
          data: {
            splitId: data.splitId,
            expenseId: data.expenseId,
            tripId: data.tripId,
            amount: data.amount,
            paidBy: data.paidBy,
            paidTo: data.paidTo,
            ...data,
          },
          timestamp: data.timestamp || new Date().toISOString(),
        }),
      );
    };

    // Listen for payment confirmed notifications
    const handlePaymentConfirmed = (data: any) => {
      console.log('✅ Payment confirmed notification received:', data);
      dispatch(
        addSocketNotification({
          id: data.id || `payment-confirmed-${Date.now()}`,
          type: 'PAYMENT_CONFIRMED',
          title: data.title || 'Thanh toán được xác nhận',
          message: data.message,
          refId: data.splitId || data.refId,
          data: {
            splitId: data.splitId,
            expenseId: data.expenseId,
            tripId: data.tripId,
            amount: data.amount,
            paidBy: data.paidBy,
            paidTo: data.paidTo,
            ...data,
          },
          timestamp: data.timestamp || new Date().toISOString(),
        }),
      );
    };

    // Listen for expense created notifications
    const handleExpenseCreated = (data: any) => {
      console.log('📝 Expense created notification received:', data);
      dispatch(
        addSocketNotification({
          id: data.id || `expense-${Date.now()}`,
          type: 'EXPENSE_CREATED',
          title: data.title || 'Khoản chi phí mới',
          message: data.message,
          refId: data.expenseId || data.refId,
          data: {
            expenseId: data.expenseId,
            tripId: data.tripId,
            description: data.expenseDescription,
            amount: data.amount,
            paidBy: data.paidBy,
            ...data,
          },
          timestamp: data.timestamp || new Date().toISOString(),
        }),
      );
    };

    // Listen for trip invite notifications
    const handleUserInvited = (data: any) => {
      dispatch(
        addSocketNotification({
          id: data.id || `invite-${Date.now()}`,
          type: 'TRIP_INVITE',
          title: data.title || 'Lời mời tham gia chuyến đi',
          message: data.message,
          refId: data.tripId || data.refId,
          data: {
            tripId: data.tripId,
            tripName: data.tripName,
            invitedBy: data.invitedBy,
            ...data,
          },
          timestamp: data.timestamp || new Date().toISOString(),
        }),
      );
    };

    // Listen for member joined notifications
    const handleMemberJoined = (data: any) => {
      console.log('👥 Member joined notification received:', data);
      dispatch(
        addSocketNotification({
          id: data.id || `member-joined-${Date.now()}`,
          type: 'MEMBER_JOINED',
          title: data.title || 'Thành viên mới tham gia',
          message: data.message,
          refId: data.tripId || data.refId,
          data: {
            tripId: data.tripId,
            memberName: data.memberName,
            ...data,
          },
          timestamp: data.timestamp || new Date().toISOString(),
        }),
      );
    };

    // Listen for invite rejected notifications
    const handleInviteRejected = (data: any) => {
      console.log('❌ Invite rejected notification received:', data);
      dispatch(
        addSocketNotification({
          id: data.id || `invite-rejected-${Date.now()}`,
          type: 'INVITATION_REJECTED',
          title: data.title || 'Lời mời bị từ chối',
          message: data.message,
          refId: data.tripId || data.refId,
          data: {
            tripId: data.tripId,
            ...data,
          },
          timestamp: data.timestamp || new Date().toISOString(),
        }),
      );
    };

    // Register listeners
    socket.on('trip:reminder', handleReminder);
    socket.on('trip:payment-marked', handlePaymentMarked);
    socket.on('trip:payment-confirmed', handlePaymentConfirmed);
    socket.on('trip:expense-created', handleExpenseCreated);
    socket.on('trip:user-invited', handleUserInvited);
    socket.on('trip:member-joined', handleMemberJoined);
    socket.on('trip:invite-rejected', handleInviteRejected);

    listenersSetupRef.current = true;

    // Handle reconnection - re-register listeners
    const handleReconnect = () => {
      console.log('🔄 [Socket] Reconnected! Re-registering listeners...');
      console.log('   Socket ID:', socket.id);
      console.log('   Connected rooms:', (socket as any).rooms || []);

      socket.on('trip:reminder', handleReminder);
      socket.on('trip:payment-marked', handlePaymentMarked);
      socket.on('trip:payment-confirmed', handlePaymentConfirmed);
      socket.on('trip:expense-created', handleExpenseCreated);
      socket.on('trip:user-invited', handleUserInvited);
      socket.on('trip:member-joined', handleMemberJoined);
      socket.on('trip:invite-rejected', handleInviteRejected);

      console.log('✅ All listeners re-registered after reconnect');
    };

    socket.on('connect', handleReconnect);

    // Listen for disconnect
    const handleDisconnect = (reason: string) => {
      console.warn(`⚠️ [Socket] Disconnected - Reason: ${reason}`);
      listenersSetupRef.current = false;
    };
    socket.on('disconnect', handleDisconnect);

    // Cleanup listeners on unmount
    return () => {
      console.log('🧹 [useSocketNotifications] Cleaning up listeners...');
      socket.off('trip:reminder', handleReminder);
      socket.off('trip:payment-marked', handlePaymentMarked);
      socket.off('trip:payment-confirmed', handlePaymentConfirmed);
      socket.off('trip:expense-created', handleExpenseCreated);
      socket.off('trip:user-invited', handleUserInvited);
      socket.off('trip:member-joined', handleMemberJoined);
      socket.off('trip:invite-rejected', handleInviteRejected);
      socket.off('connect', handleReconnect);
      socket.off('disconnect', handleDisconnect);
      listenersSetupRef.current = false;
    };
  }, [socket, isConnected, dispatch]); // Add isConnected to dependency
};
