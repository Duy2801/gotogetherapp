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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const notification_service_1 = require("./notification.service");
const send_reminder_dto_1 = require("./dto/send-reminder.dto");
const prisma_service_1 = require("../prisma/prisma.service");
let NotificationController = class NotificationController {
    notificationService;
    prisma;
    constructor(notificationService, prisma) {
        this.notificationService = notificationService;
        this.prisma = prisma;
    }
    async sendReminder(req, toUserId, dto) {
        const currentUserId = req.user.userId;
        const sharedTrip = await this.prisma.tripMember.findFirst({
            where: {
                AND: [
                    { userId: currentUserId },
                    {
                        trip: {
                            members: {
                                some: { userId: toUserId },
                            },
                        },
                    },
                ],
            },
        });
        if (!sharedTrip) {
            throw new Error("Users are not members of the same trip");
        }
        const currentUser = await this.prisma.user.findUnique({
            where: { id: currentUserId },
            select: { fullName: true },
        });
        await this.notificationService.sendReminder(toUserId, currentUser?.fullName || "Unknown", 0, dto.message);
        return { message: "Reminder sent successfully" };
    }
    async getNotifications(req, limit = "20", offset = "0") {
        return this.notificationService.getUserNotifications(req.user.userId, parseInt(limit), parseInt(offset));
    }
    async markAsRead(notificationId) {
        return this.notificationService.markAsRead(notificationId);
    }
    async deleteNotification(notificationId) {
        await this.notificationService.deleteNotification(notificationId);
        return { message: "Notification deleted successfully" };
    }
    async clearAllNotifications(req) {
        await this.notificationService.clearAllNotifications(req.user.userId);
        return { message: "All notifications cleared" };
    }
};
exports.NotificationController = NotificationController;
__decorate([
    (0, common_1.Post)("remind/:toUserId"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("toUserId")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, send_reminder_dto_1.SendReminderDto]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "sendReminder", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)("limit")),
    __param(2, (0, common_1.Query)("offset")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "getNotifications", null);
__decorate([
    (0, common_1.Post)(":id/read"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "markAsRead", null);
__decorate([
    (0, common_1.Delete)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "deleteNotification", null);
__decorate([
    (0, common_1.Delete)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "clearAllNotifications", null);
exports.NotificationController = NotificationController = __decorate([
    (0, common_1.Controller)("notification"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiTags)("Notification"),
    __metadata("design:paramtypes", [notification_service_1.NotificationService,
        prisma_service_1.PrismaService])
], NotificationController);
//# sourceMappingURL=notification.controller.js.map