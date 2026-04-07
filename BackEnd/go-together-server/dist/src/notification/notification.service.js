"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const notification_gateway_1 = require("./notification.gateway");
let NotificationService = class NotificationService {
    prisma;
    notificationGateway;
    constructor(prisma, notificationGateway) {
        this.prisma = prisma;
        this.notificationGateway = notificationGateway;
    }
    async createPaymentMarkedNotification(toUserId, fromUserId, splitId, expenseId, tripId, message, data) {
        try {
            const notification = await this.prisma.notification.create({
                data: {
                    userId: toUserId,
                    senderId: fromUserId,
                    type: "PAYMENT_MARKED",
                    title: "Thanh toán được đánh dấu",
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
            console.log(`[PaymentMarked] Created notification: ${notification.id} for user: ${toUserId}`);
            return notification;
        }
        catch (error) {
            console.error("[PaymentMarked] Error creating notification:", error);
            throw error;
        }
    }
    async createPaymentConfirmedNotification(toUserId, fromUserId, splitId, expenseId, tripId, message, data) {
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
            console.log(`[PaymentConfirmed] Created notification: ${notification.id} for user: ${toUserId}`);
            return notification;
        }
        catch (error) {
            console.error("[PaymentConfirmed] Error creating notification:", error);
            throw error;
        }
    }
    async createExpenseCreatedNotification(toUserId, fromUserId, expenseId, tripId, message, data) {
        try {
            const notification = await this.prisma.notification.create({
                data: {
                    userId: toUserId,
                    senderId: fromUserId,
                    type: "EXPENSE_CREATED",
                    title: "Chi phí mới",
                    message,
                    refId: expenseId,
                    data: {
                        expenseId,
                        tripId,
                        ...data,
                    },
                },
            });
            console.log(`[ExpenseCreated] Created notification: ${notification.id} for user: ${toUserId}`);
            return notification;
        }
        catch (error) {
            console.error("[ExpenseCreated] Error creating notification:", error);
            throw error;
        }
    }
    async createTripInviteNotification(toUserId, fromUserId, tripId, message, data) {
        try {
            const notification = await this.prisma.notification.create({
                data: {
                    userId: toUserId,
                    senderId: fromUserId,
                    type: "TRIP_INVITE",
                    title: "Lời mời tham gia chuyến đi",
                    message,
                    refId: tripId,
                    data: {
                        tripId,
                        ...data,
                    },
                },
            });
            console.log(`[TripInvite] Created notification: ${notification.id} for user: ${toUserId}`);
            return notification;
        }
        catch (error) {
            console.error("[TripInvite] Error creating notification:", error);
            throw error;
        }
    }
    async createMemberJoinedNotification(toUserId, fromUserId, tripId, message, data) {
        try {
            const notification = await this.prisma.notification.create({
                data: {
                    userId: toUserId,
                    senderId: fromUserId,
                    type: "MEMBER_JOINED",
                    title: "Thành viên mới tham gia",
                    message,
                    refId: tripId,
                    data: {
                        tripId,
                        ...data,
                    },
                },
            });
            console.log(`[MemberJoined] Created notification: ${notification.id} for user: ${toUserId}`);
            return notification;
        }
        catch (error) {
            console.error("[MemberJoined] Error creating notification:", error);
            throw error;
        }
    }
    async createInviteRejectedNotification(toUserId, fromUserId, tripId, message, data) {
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
            console.log(`[InviteRejected] Created notification: ${notification.id} for user: ${toUserId}`);
            return notification;
        }
        catch (error) {
            console.error("[InviteRejected] Error creating notification:", error);
            throw error;
        }
    }
    async sendReminder(toUserId, fromUserId, fromUserName, amount, message, splitId) {
        const reminderMessage = message || `${fromUserName} nhắc bạn thanh toán khoản tiền.`;
        try {
            const notification = await this.prisma.notification.create({
                data: {
                    userId: toUserId,
                    senderId: fromUserId,
                    type: "SETTLEMENT_REMINDER",
                    title: "Nhắc nhở thanh toán",
                    message: reminderMessage,
                    refId: splitId,
                    data: {
                        amount,
                        fromUserName,
                        splitId,
                    },
                },
            });
            console.log(`[Reminder] Created notification: ${notification.id} for user: ${toUserId}`);
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
        }
        catch (error) {
            console.error("[Reminder] Error sending reminder:", error);
            throw error;
        }
    }
    async markAsRead(notificationId) {
        return this.prisma.notification.update({
            where: { id: notificationId },
            data: {
                isRead: true,
                readAt: new Date(),
            },
        });
    }
    async deleteNotification(notificationId) {
        return this.prisma.notification.delete({
            where: { id: notificationId },
        });
    }
    async clearAllNotifications(userId) {
        return this.prisma.notification.deleteMany({
            where: { userId },
        });
    }
    async getUserNotifications(userId, limit = 20, offset = 0) {
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
                    refId: true,
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
        console.log(`📤 [getUserNotifications] Returning ${notifications.length} notifications:`, notifications
            .slice(0, 2)
            .map((n) => ({ type: n.type, refId: n.refId, data: n.data })));
        return {
            notifications,
            unreadCount,
            total,
            page: Math.floor(offset / limit) + 1,
            pageSize: limit,
        };
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notification_gateway_1.NotificationGateway])
], NotificationService);
//# sourceMappingURL=notification.service.js.map