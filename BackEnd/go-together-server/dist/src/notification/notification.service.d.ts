import { PrismaService } from "src/prisma/prisma.service";
import { NotificationGateway } from "./notification.gateway";
export declare class NotificationService {
    private prisma;
    private notificationGateway;
    constructor(prisma: PrismaService, notificationGateway: NotificationGateway);
    createPaymentMarkedNotification(toUserId: string, fromUserId: string, splitId: string, expenseId: string, tripId: string, message: string, data?: any): Promise<{
        type: import("../../prisma/generated/enums").NotificationType;
        title: string;
        message: string;
        data: import("@prisma/client/runtime/client").JsonValue | null;
        id: string;
        refId: string | null;
        isRead: boolean;
        readAt: Date | null;
        createdAt: Date;
        userId: string;
        senderId: string | null;
    }>;
    createPaymentConfirmedNotification(toUserId: string, fromUserId: string, splitId: string, expenseId: string, tripId: string, message: string, data?: any): Promise<{
        type: import("../../prisma/generated/enums").NotificationType;
        title: string;
        message: string;
        data: import("@prisma/client/runtime/client").JsonValue | null;
        id: string;
        refId: string | null;
        isRead: boolean;
        readAt: Date | null;
        createdAt: Date;
        userId: string;
        senderId: string | null;
    }>;
    createExpenseCreatedNotification(toUserId: string, fromUserId: string, expenseId: string, tripId: string, message: string, data?: any): Promise<{
        type: import("../../prisma/generated/enums").NotificationType;
        title: string;
        message: string;
        data: import("@prisma/client/runtime/client").JsonValue | null;
        id: string;
        refId: string | null;
        isRead: boolean;
        readAt: Date | null;
        createdAt: Date;
        userId: string;
        senderId: string | null;
    }>;
    createTripInviteNotification(toUserId: string, fromUserId: string, tripId: string, message: string, data?: any): Promise<{
        type: import("../../prisma/generated/enums").NotificationType;
        title: string;
        message: string;
        data: import("@prisma/client/runtime/client").JsonValue | null;
        id: string;
        refId: string | null;
        isRead: boolean;
        readAt: Date | null;
        createdAt: Date;
        userId: string;
        senderId: string | null;
    }>;
    createMemberJoinedNotification(toUserId: string, fromUserId: string, tripId: string, message: string, data?: any): Promise<{
        type: import("../../prisma/generated/enums").NotificationType;
        title: string;
        message: string;
        data: import("@prisma/client/runtime/client").JsonValue | null;
        id: string;
        refId: string | null;
        isRead: boolean;
        readAt: Date | null;
        createdAt: Date;
        userId: string;
        senderId: string | null;
    }>;
    createInviteRejectedNotification(toUserId: string, fromUserId: string, tripId: string, message: string, data?: any): Promise<{
        type: import("../../prisma/generated/enums").NotificationType;
        title: string;
        message: string;
        data: import("@prisma/client/runtime/client").JsonValue | null;
        id: string;
        refId: string | null;
        isRead: boolean;
        readAt: Date | null;
        createdAt: Date;
        userId: string;
        senderId: string | null;
    }>;
    sendReminder(toUserId: string, fromUserId: string, fromUserName: string, amount: number, message?: string, splitId?: string): Promise<void>;
    markAsRead(notificationId: string): Promise<{
        type: import("../../prisma/generated/enums").NotificationType;
        title: string;
        message: string;
        data: import("@prisma/client/runtime/client").JsonValue | null;
        id: string;
        refId: string | null;
        isRead: boolean;
        readAt: Date | null;
        createdAt: Date;
        userId: string;
        senderId: string | null;
    }>;
    deleteNotification(notificationId: string): Promise<{
        type: import("../../prisma/generated/enums").NotificationType;
        title: string;
        message: string;
        data: import("@prisma/client/runtime/client").JsonValue | null;
        id: string;
        refId: string | null;
        isRead: boolean;
        readAt: Date | null;
        createdAt: Date;
        userId: string;
        senderId: string | null;
    }>;
    clearAllNotifications(userId: string): Promise<import("../../prisma/generated/internal/prismaNamespace").BatchPayload>;
    getUserNotifications(userId: string, limit?: number, offset?: number): Promise<{
        notifications: {
            type: import("../../prisma/generated/enums").NotificationType;
            title: string;
            message: string;
            data: import("@prisma/client/runtime/client").JsonValue;
            id: string;
            refId: string | null;
            isRead: boolean;
            readAt: Date | null;
            createdAt: Date;
            sender: {
                id: string;
                fullName: string | null;
                avatar: string | null;
            } | null;
            userId: string;
            senderId: string | null;
        }[];
        unreadCount: number;
        total: number;
        page: number;
        pageSize: number;
    }>;
}
