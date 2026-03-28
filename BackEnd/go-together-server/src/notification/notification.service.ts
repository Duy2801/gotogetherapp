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
    fromUserName: string,
    amount: number,
    message?: string,
  ) {
    const reminderMessage =
      message || `${fromUserName} nhắc bạn thanh toán khoản tiền.`;

    // Create notification record
    await this.prisma.notification.create({
      data: {
        userId: toUserId,
        type: "SETTLEMENT_REMINDER",
        title: "Nhắc nhở thanh toán",
        message: reminderMessage,
        data: {
          amount,
          fromUserName,
        },
      },
    });

    // Emit real-time notification
    this.notificationGateway.emitReminder(toUserId, {
      type: "SETTLEMENT_REMINDER",
      title: "Nhắc nhở thanh toán",
      message: reminderMessage,
      amount,
      fromUserName,
      timestamp: new Date(),
    });
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
   * Get user notifications
   */
  async getUserNotifications(userId: string, limit = 20, offset = 0) {
    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
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

