import { PrismaService } from "src/prisma/prisma.service";
import { NotificationGateway } from "./notification.gateway";
export declare class NotificationService {
    private prisma;
    private notificationGateway;
    constructor(prisma: PrismaService, notificationGateway: NotificationGateway);
    sendReminder(toUserId: string, fromUserName: string, amount: number, message?: string): Promise<void>;
    markAsRead(notificationId: string): Promise<{
        data: import("@prisma/client/runtime/client").JsonValue | null;
        id: string;
        userId: string;
        type: import("../../prisma/generated/enums").NotificationType;
        title: string;
        message: string;
        isRead: boolean;
        readAt: Date | null;
        createdAt: Date;
    }>;
    deleteNotification(notificationId: string): Promise<{
        data: import("@prisma/client/runtime/client").JsonValue | null;
        id: string;
        userId: string;
        type: import("../../prisma/generated/enums").NotificationType;
        title: string;
        message: string;
        isRead: boolean;
        readAt: Date | null;
        createdAt: Date;
    }>;
    clearAllNotifications(userId: string): Promise<import("../../prisma/generated/internal/prismaNamespace").BatchPayload>;
    getUserNotifications(userId: string, limit?: number, offset?: number): Promise<{
        notifications: {
            data: import("@prisma/client/runtime/client").JsonValue | null;
            id: string;
            userId: string;
            type: import("../../prisma/generated/enums").NotificationType;
            title: string;
            message: string;
            isRead: boolean;
            readAt: Date | null;
            createdAt: Date;
        }[];
        total: number;
        page: number;
        pageSize: number;
    }>;
}
