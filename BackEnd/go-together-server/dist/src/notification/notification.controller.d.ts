import { NotificationService } from "./notification.service";
import { SendReminderDto } from "./dto/send-reminder.dto";
import { PrismaService } from "src/prisma/prisma.service";
export declare class NotificationController {
    private notificationService;
    private prisma;
    constructor(notificationService: NotificationService, prisma: PrismaService);
    sendReminder(req: any, toUserId: string, dto: SendReminderDto): Promise<{
        message: string;
    }>;
    getNotifications(req: any, limit?: string, offset?: string): Promise<{
        notifications: ({
            sender: {
                id: string;
                fullName: string | null;
                avatar: string | null;
            } | null;
        } & {
            id: string;
            userId: string;
            type: import("../../prisma/generated/enums").NotificationType;
            title: string;
            message: string;
            refId: string | null;
            senderId: string | null;
            data: import("@prisma/client/runtime/client").JsonValue | null;
            isRead: boolean;
            readAt: Date | null;
            createdAt: Date;
        })[];
        total: number;
        page: number;
        pageSize: number;
    }>;
    markAsRead(notificationId: string): Promise<{
        id: string;
        userId: string;
        type: import("../../prisma/generated/enums").NotificationType;
        title: string;
        message: string;
        refId: string | null;
        senderId: string | null;
        data: import("@prisma/client/runtime/client").JsonValue | null;
        isRead: boolean;
        readAt: Date | null;
        createdAt: Date;
    }>;
    deleteNotification(notificationId: string): Promise<{
        message: string;
    }>;
    debugSocketStatus(): {
        connectedUsersCount: any;
        allConnectedUsers: {
            userId: any;
            socketId: any;
            rooms: unknown[];
        }[];
        allRoomsOnServer: unknown[];
        timestamp: string;
    };
}
