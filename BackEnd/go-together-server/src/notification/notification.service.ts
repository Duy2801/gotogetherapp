import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { NotificationGateway } from "./notification.gateway";

@Injectable()
export class NotificationService {
  constructor(
    private prisma: PrismaService,
    private notificationGateway: NotificationGateway,
  ) {}

  /**
   * Create a payment marked notification for a specific user
   * Used when a payment is marked as paid
   */
  async createPaymentMarkedNotification(
    toUserId: string,
    fromUserId: string,
    splitId: string,
    expenseId: string,
    tripId: string,
    message: string,
    data?: any,
  ) {
    try {
      const notification = await this.prisma.notification.create({
        data: {
          userId: toUserId,
          senderId: fromUserId,
          type: "PAYMENT_MARKED",
          title: "Thanh toán được đánh dấu",
          message,
          refId: splitId, // Reference to the split ID
          data: {
            splitId,
            expenseId,
            tripId,
            ...data,
          },
        },
      });

      console.log(
        `[PaymentMarked] Created notification: ${notification.id} for user: ${toUserId}`,
      );
      return notification;
    } catch (error: any) {
      console.error("[PaymentMarked] Error creating notification:", error);
      throw error;
    }
  }

  /**
   * Create a payment confirmed notification for a specific user
   */
  async createPaymentConfirmedNotification(
    toUserId: string,
    fromUserId: string,
    splitId: string,
    expenseId: string,
    tripId: string,
    message: string,
    data?: any,
  ) {
    try {
      const notification = await this.prisma.notification.create({
        data: {
          userId: toUserId,
          senderId: fromUserId,
          type: "PAYMENT_CONFIRMED",
          title: "Thanh toán được xác nhận",
          message,
          refId: splitId,
          data: {
            splitId,
            expenseId,
            tripId,
            ...data,
          },
        },
      });

      console.log(
        `[PaymentConfirmed] Created notification: ${notification.id} for user: ${toUserId}`,
      );
      return notification;
    } catch (error: any) {
      console.error("[PaymentConfirmed] Error creating notification:", error);
      throw error;
    }
  }

  /**
   * Create an expense created notification for a specific user
   */
  async createExpenseCreatedNotification(
    toUserId: string,
    fromUserId: string,
    expenseId: string,
    tripId: string,
    message: string,
    data?: any,
  ) {
    try {
      const notification = await this.prisma.notification.create({
        data: {
          userId: toUserId,
          senderId: fromUserId,
          type: "EXPENSE_CREATED",
          title: "Chi phí mới",
          message,
          refId: expenseId, // Reference to the expense
          data: {
            expenseId,
            tripId,
            ...data,
          },
        },
      });

      console.log(
        `[ExpenseCreated] Created notification: ${notification.id} for user: ${toUserId}`,
      );
      return notification;
    } catch (error: any) {
      console.error("[ExpenseCreated] Error creating notification:", error);
      throw error;
    }
  }

  /**
   * Create a trip invite notification for a specific user
   */
  async createTripInviteNotification(
    toUserId: string,
    fromUserId: string,
    tripId: string,
    message: string,
    data?: any,
  ) {
    try {
      const notification = await this.prisma.notification.create({
        data: {
          userId: toUserId,
          senderId: fromUserId,
          type: "TRIP_INVITE",
          title: "Lời mời tham gia chuyến đi",
          message,
          refId: tripId, // Reference to the trip
          data: {
            tripId,
            ...data,
          },
        },
      });

      console.log(
        `[TripInvite] Created notification: ${notification.id} for user: ${toUserId}`,
      );
      return notification;
    } catch (error: any) {
      console.error("[TripInvite] Error creating notification:", error);
      throw error;
    }
  }

  /**
   * Create a member joined notification for a specific user
   */
  async createMemberJoinedNotification(
    toUserId: string,
    fromUserId: string,
    tripId: string,
    message: string,
    data?: any,
  ) {
    try {
      const notification = await this.prisma.notification.create({
        data: {
          userId: toUserId,
          senderId: fromUserId,
          type: "MEMBER_JOINED",
          title: "Thành viên mới tham gia",
          message,
          refId: tripId, // Reference to the trip
          data: {
            tripId,
            ...data,
          },
        },
      });

      console.log(
        `[MemberJoined] Created notification: ${notification.id} for user: ${toUserId}`,
      );
      return notification;
    } catch (error: any) {
      console.error("[MemberJoined] Error creating notification:", error);
      throw error;
    }
  }

  /**
   * Create an invitation rejected notification for a specific user
   */
  async createInviteRejectedNotification(
    toUserId: string,
    fromUserId: string,
    tripId: string,
    message: string,
    data?: any,
  ) {
    try {
      const notification = await this.prisma.notification.create({
        data: {
          userId: toUserId,
          senderId: fromUserId,
          type: "INVITATION_REJECTED",
          title: "Lời mời bị từ chối",
          message,
          refId: tripId,
          data: {
            tripId,
            ...data,
          },
        },
      });

      console.log(
        `[InviteRejected] Created notification: ${notification.id} for user: ${toUserId}`,
      );
      return notification;
    } catch (error: any) {
      console.error("[InviteRejected] Error creating notification:", error);
      throw error;
    }
  }

  /**
   * Send reminder notification to a user
   */
  async sendReminder(
    toUserId: string,
    fromUserId: string,
    fromUserName: string,
    amount: number,
    message?: string,
    splitId?: string,
  ) {
    const reminderMessage =
      message || `${fromUserName} nhắc bạn thanh toán khoản tiền.`;

    try {
      // Create notification record
      const notification = await this.prisma.notification.create({
        data: {
          userId: toUserId,
          senderId: fromUserId, // Lưu ID người nhắc nợ
          type: "SETTLEMENT_REMINDER",
          title: "Nhắc nhở thanh toán",
          message: reminderMessage,
          refId: splitId, // Include splitId if provided
          data: {
            amount,
            fromUserName,
            splitId,
          },
        },
      });

      console.log(
        `[Reminder] Created notification: ${notification.id} for user: ${toUserId}`,
      );

      // Emit real-time notification
      this.notificationGateway.emitReminder(toUserId, {
        id: notification.id,
        type: "SETTLEMENT_REMINDER",
        title: "Nhắc nhở thanh toán",
        message: reminderMessage,
        amount,
        fromUserName,
        senderId: fromUserId,
        refId: splitId,
        timestamp: new Date().toISOString(),
      });

      console.log(`[Reminder] Socket event emitted to user: ${toUserId}`);
    } catch (error: any) {
      console.error("[Reminder] Error sending reminder:", error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string) {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  /**
   * Delete a single notification
   */
  async deleteNotification(notificationId: string) {
    return this.prisma.notification.delete({
      where: { id: notificationId },
    });
  }

  /**
   * Clear all notifications for a user
   */
  async clearAllNotifications(userId: string) {
    return this.prisma.notification.deleteMany({
      where: { userId },
    });
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(userId: string, limit = 20, offset = 0) {
    const [notifications, unreadCount, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        select: {
          id: true,
          userId: true,
          type: true,
          title: true,
          message: true,
          refId: true, // IMPORTANT: Include refId for navigation
          senderId: true,
          data: true,
          isRead: true,
          readAt: true,
          createdAt: true,
          sender: {
            select: { id: true, fullName: true, avatar: true },
          },
        },
      }),
      this.prisma.notification.count({
        where: { userId, isRead: false },
      }),
      this.prisma.notification.count({ where: { userId } }),
    ]);

    console.log(
      `📤 [getUserNotifications] Returning ${notifications.length} notifications:`,
      notifications
        .slice(0, 2)
        .map((n) => ({ type: n.type, refId: n.refId, data: n.data })),
    );

    return {
      notifications,
      unreadCount,
      total,
      page: Math.floor(offset / limit) + 1,
      pageSize: limit,
    };
  }
}
