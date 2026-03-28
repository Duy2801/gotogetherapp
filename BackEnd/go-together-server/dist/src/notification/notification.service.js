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
    async sendReminder(toUserId, fromUserName, amount, message) {
        const reminderMessage = message || `${fromUserName} nhắc bạn thanh toán khoản tiền.`;
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
        this.notificationGateway.emitReminder(toUserId, {
            type: "SETTLEMENT_REMINDER",
            title: "Nhắc nhở thanh toán",
            message: reminderMessage,
            amount,
            fromUserName,
            timestamp: new Date(),
        });
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
    async getUserNotifications(userId, limit = 20, offset = 0) {
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
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notification_gateway_1.NotificationGateway])
], NotificationService);
//# sourceMappingURL=notification.service.js.map