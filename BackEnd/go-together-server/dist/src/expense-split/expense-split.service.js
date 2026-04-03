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
exports.ExpenseSplitService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const notification_gateway_1 = require("../notification/notification.gateway");
let ExpenseSplitService = class ExpenseSplitService {
    prisma;
    notificationGateway;
    constructor(prisma, notificationGateway) {
        this.prisma = prisma;
        this.notificationGateway = notificationGateway;
    }
    async markAsPaid(userId, splitId) {
        const split = await this.prisma.expenseSplit.findUnique({
            where: { id: splitId },
            include: {
                expense: {
                    include: {
                        paidBy: { select: { fullName: true } },
                    },
                },
                user: { select: { fullName: true } },
            },
        });
        if (!split) {
            throw new common_1.NotFoundException("Khoản chia tiền không tồn tại");
        }
        if (split.userId !== userId) {
            console.log(split.userId, userId);
            throw new common_1.ForbiddenException("Bạn không thể thanh toán khoản này");
        }
        if (split.isPaid) {
            throw new common_1.BadRequestException("Khoản này đã được đánh dấu trả rồi");
        }
        const updated = await this.prisma.expenseSplit.update({
            where: { id: splitId },
            data: {
                isPaid: true,
                paidAt: new Date(),
            },
        });
        this.notificationGateway.emitPaymentMarked(split.expense.tripId, {
            type: "PAYMENT_MARKED",
            message: `${split.user.fullName} đã đánh dấu trả tiền cho ${split.expense.description}`,
            amount: split.amount,
            paidBy: split.user.fullName,
            paidTo: split.expense.paidBy.fullName,
            splitId: split.id,
            timestamp: new Date().toISOString(),
        });
        return updated;
    }
    async confirmReceived(userId, splitId) {
        const split = await this.prisma.expenseSplit.findUnique({
            where: { id: splitId },
            include: {
                expense: {
                    include: {
                        paidBy: { select: { fullName: true } },
                    },
                },
                user: { select: { fullName: true } },
            },
        });
        if (!split) {
            throw new common_1.NotFoundException("Khoản chia tiền không tồn tại");
        }
        if (!split.isPaid) {
            throw new common_1.BadRequestException("Người này chưa đánh dấu đã trả");
        }
        if (split.confirmed) {
            throw new common_1.BadRequestException("Khoản này đã được xác nhận rồi");
        }
        if (String(split.expense.paidById) !== String(userId)) {
            throw new common_1.ForbiddenException("Bạn không có quyền xác nhận khoản này");
        }
        const updated = await this.prisma.expenseSplit.update({
            where: { id: splitId },
            data: {
                confirmed: true,
                confirmedAt: new Date(),
            },
        });
        this.notificationGateway.emitPaymentConfirmed(split.expense.tripId, {
            type: "PAYMENT_CONFIRMED",
            message: `${split.expense.paidBy.fullName} đã xác nhận nhận tiền từ ${split.user.fullName}`,
            amount: split.amount,
            paidBy: split.user.fullName,
            paidTo: split.expense.paidBy.fullName,
            splitId: split.id,
            timestamp: new Date().toISOString(),
        });
        return updated;
    }
};
exports.ExpenseSplitService = ExpenseSplitService;
exports.ExpenseSplitService = ExpenseSplitService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notification_gateway_1.NotificationGateway])
], ExpenseSplitService);
//# sourceMappingURL=expense-split.service.js.map