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
   * Send reminder notification to a user
   */
  async sendReminder(
    toUserId: string,
    fromUserId: string,
    fromUserName: string,
    amount: number,
    message?: string,
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
          data: {
            amount,
            fromUserName,
          },
        },
      });

      console.log(`[Reminder] Created notification: ${notification.id} for user: ${toUserId}`);

      // Emit real-time notification
      this.notificationGateway.emitReminder(toUserId, {
        id: notification.id,
        type: "SETTLEMENT_REMINDER",
        title: "Nhắc nhở thanh toán",
        message: reminderMessage,
        amount,
        fromUserName,
        senderId: fromUserId,
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
    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        include: {
          sender: {
            select: { id: true, fullName: true, avatar: true },
          },
        },
      }),
      this.prisma.notification.count({ where: { userId } }),
    ]);

    return {
      notifications,
      total,
      page: Math.floor(offset / limit) + 1,
      pageSize: limit,
    };
  }
}

