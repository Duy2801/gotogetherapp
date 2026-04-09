import { NotificationGateway } from "./notification.gateway";
import { NotificationService } from "./notification.service";
import { SendReminderDto } from "./dto/send-reminder.dto";
import { PrismaService } from "src/prisma/prisma.service";
export declare class NotificationController {
    private notificationGateway;
    private notificationService;
    private prisma;
    constructor(notificationGateway: NotificationGateway, notificationService: NotificationService, prisma: PrismaService);
    sendReminder(req: any, toUserId: string, dto: SendReminderDto): Promise<{
        message: string;
    }>;
    getNotifications(req: any, limit?: string, offset?: string): Promise<{
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
    clearAllNotifications(req: any): Promise<{
        message: string;
        deleted: number;
    }>;
    deleteNotification(notificationId: string): Promise<{
        message: string;
    }>;
    debugSocketStatus(): {
        connectedUsersCount: number;
        allConnectedUsers: {
            userId: any;
            socketId: any;
            rooms: unknown[];
        }[];
        allRoomsOnServer: string[];
        timestamp: string;
    };
}
