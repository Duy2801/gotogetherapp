import { PrismaService } from "src/prisma/prisma.service";
import { NotificationGateway } from "./notification.gateway";
export declare class NotificationService {
    private prisma;
    private notificationGateway;
    constructor(prisma: PrismaService, notificationGateway: NotificationGateway);
    createPaymentMarkedNotification(toUserId: string, fromUserId: string, splitId: string, expenseId: string, tripId: string, message: string, data?: any): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        type: import("../../prisma/generated/enums").NotificationType;
        title: string;
        message: string;
        refId: string | null;
        senderId: string | null;
        data: import("@prisma/client/runtime/client").JsonValue | null;
        isRead: boolean;
        readAt: Date | null;
    }>;
    createPaymentConfirmedNotification(toUserId: string, fromUserId: string, splitId: string, expenseId: string, tripId: string, message: string, data?: any): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        type: import("../../prisma/generated/enums").NotificationType;
        title: string;
        message: string;
        refId: string | null;
        senderId: string | null;
        data: import("@prisma/client/runtime/client").JsonValue | null;
        isRead: boolean;
        readAt: Date | null;
    }>;
    createExpenseCreatedNotification(toUserId: string, fromUserId: string, expenseId: string, tripId: string, message: string, data?: any): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        type: import("../../prisma/generated/enums").NotificationType;
        title: string;
        message: string;
        refId: string | null;
        senderId: string | null;
        data: import("@prisma/client/runtime/client").JsonValue | null;
        isRead: boolean;
        readAt: Date | null;
    }>;
    createTripInviteNotification(toUserId: string, fromUserId: string, tripId: string, message: string, data?: any): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        type: import("../../prisma/generated/enums").NotificationType;
        title: string;
        message: string;
        refId: string | null;
        senderId: string | null;
        data: import("@prisma/client/runtime/client").JsonValue | null;
        isRead: boolean;
        readAt: Date | null;
    }>;
    createMemberJoinedNotification(toUserId: string, fromUserId: string, tripId: string, message: string, data?: any): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        type: import("../../prisma/generated/enums").NotificationType;
        title: string;
        message: string;
        refId: string | null;
        senderId: string | null;
        data: import("@prisma/client/runtime/client").JsonValue | null;
        isRead: boolean;
        readAt: Date | null;
    }>;
    createInviteRejectedNotification(toUserId: string, fromUserId: string, tripId: string, message: string, data?: any): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        type: import("../../prisma/generated/enums").NotificationType;
        title: string;
        message: string;
        refId: string | null;
        senderId: string | null;
        data: import("@prisma/client/runtime/client").JsonValue | null;
        isRead: boolean;
        readAt: Date | null;
    }>;
    sendReminder(toUserId: string, fromUserId: string, fromUserName: string, amount: number, message?: string, splitId?: string): Promise<void>;
    markAsRead(notificationId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        type: import("../../prisma/generated/enums").NotificationType;
        title: string;
        message: string;
        refId: string | null;
        senderId: string | null;
        data: import("@prisma/client/runtime/client").JsonValue | null;
        isRead: boolean;
        readAt: Date | null;
    }>;
    deleteNotification(notificationId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        type: import("../../prisma/generated/enums").NotificationType;
        title: string;
        message: string;
        refId: string | null;
        senderId: string | null;
        data: import("@prisma/client/runtime/client").JsonValue | null;
        isRead: boolean;
        readAt: Date | null;
    }>;
    clearAllNotifications(userId: string): Promise<import("../../prisma/generated/internal/prismaNamespace").BatchPayload>;
    getUserNotifications(userId: string, limit?: number, offset?: number): Promise<{
        notifications: {
            id: string;
            createdAt: Date;
            userId: string;
            type: import("../../prisma/generated/enums").NotificationType;
            title: string;
            message: string;
            refId: string | null;
            senderId: string | null;
            data: import("@prisma/client/runtime/client").JsonValue;
            isRead: boolean;
            readAt: Date | null;
            sender: {
                id: string;
                fullName: string | null;
                avatar: string | null;
            } | null;
        }[];
        unreadCount: number;
        total: number;
        page: number;
        pageSize: number;
    }>;
}
