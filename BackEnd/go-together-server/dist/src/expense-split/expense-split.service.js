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
let ExpenseSplitService = class ExpenseSplitService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async markAsPaid(userId, splitId) {
        const split = await this.prisma.expenseSplit.findUnique({
            where: { id: splitId },
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
        return this.prisma.expenseSplit.update({
            where: { id: splitId },
            data: {
                isPaid: true,
                paidAt: new Date(),
            },
        });
    }
    async confirmReceived(userId, splitId) {
        const split = await this.prisma.expenseSplit.findUnique({
            where: { id: splitId },
            include: { expense: true },
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
        return this.prisma.expenseSplit.update({
            where: { id: splitId },
            data: {
                confirmed: true,
                confirmedAt: new Date(),
            },
        });
    }
};
exports.ExpenseSplitService = ExpenseSplitService;
exports.ExpenseSplitService = ExpenseSplitService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExpenseSplitService);
//# sourceMappingURL=expense-split.service.js.map