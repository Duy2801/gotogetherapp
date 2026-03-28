import { PrismaService } from "src/prisma/prisma.service";
import { NotificationGateway } from "./notification.gateway";
export declare class NotificationService {
    private prisma;
    private notificationGateway;
    constructor(prisma: PrismaService, notificationGateway: NotificationGateway);
    sendReminder(toUserId: string, fromUserName: string, amount: number, message?: string): Promise<void>;
    markAsRead(notificationId: string): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        data: import("@prisma/client/runtime/client").JsonValue | null;
        type: import("../../prisma/generated/enums").NotificationType;
        title: string;
        message: string;
        isRead: boolean;
        readAt: Date | null;
    }>;
    getUserNotifications(userId: string, limit?: number, offset?: number): Promise<{
        notifications: {
            id: string;
            userId: string;
            createdAt: Date;
            data: import("@prisma/client/runtime/client").JsonValue | null;
            type: import("../../prisma/generated/enums").NotificationType;
            title: string;
            message: string;
            isRead: boolean;
            readAt: Date | null;
        }[];
        total: number;
        page: number;
        pageSize: number;
    }>;
}
