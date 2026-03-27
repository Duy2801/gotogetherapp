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
exports.BudgetService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let BudgetService = class BudgetService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createBudget(userId, dto) {
        const currentDate = new Date();
        const month = dto.month || currentDate.getMonth() + 1;
        const year = dto.year || currentDate.getFullYear();
        const existingBudget = await this.prisma.budget.findUnique({
            where: {
                userId_month_year: {
                    userId,
                    month,
                    year,
                },
            },
        });
        if (existingBudget) {
            throw new Error("Budget already exists for this period");
        }
        return await this.prisma.budget.create({
            data: {
                userId,
                amount: dto.amount,
                month,
                year,
                warningAt: dto.warningAt || 80,
            },
        });
    }
    async updateBudget(budgetId, userId, dto) {
        const budget = await this.prisma.budget.findFirst({
            where: {
                id: budgetId,
                userId: userId,
            },
        });
        if (!budget) {
            throw new common_1.NotFoundException("Budget not found or not yours");
        }
        return await this.prisma.budget.update({
            where: {
                id: budgetId,
            },
            data: {
                amount: dto.amount !== undefined ? dto.amount : undefined,
                warningAt: dto.warningAt !== undefined ? dto.warningAt : undefined,
            },
        });
    }
    async getBudgetByMonth(userId, month, year) {
        const currentDate = new Date();
        const targetMonth = month || currentDate.getMonth() + 1;
        const targetYear = year || currentDate.getFullYear();
        await this.autoCreateMonthlyBudget(userId, targetMonth, targetYear);
        const budget = await this.prisma.budget.findUnique({
            where: {
                userId_month_year: {
                    userId,
                    month: targetMonth,
                    year: targetYear,
                },
            },
        });
        if (!budget) {
            return null;
        }
        const startDate = new Date(targetYear, targetMonth - 1, 1);
        const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);
        const expenseSum = await this.prisma.expense.aggregate({
            where: {
                paidById: userId,
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            _sum: {
                amount: true,
            },
        });
        const spent = Number(expenseSum._sum.amount ?? 0);
        const amount = Number(budget.amount);
        const remaining = amount - spent;
        const percentage = amount > 0 ? Math.round((spent / amount) * 100) : 0;
        return {
            ...budget,
            spent,
            remaining,
            percentage,
        };
    }
    async autoCreateMonthlyBudget(userId, month, year) {
        const existingBudget = await this.prisma.budget.findUnique({
            where: {
                userId_month_year: {
                    userId,
                    month,
                    year,
                },
            },
        });
        if (existingBudget) {
            return;
        }
        let prevMonth = month - 1;
        let prevYear = year;
        if (prevMonth === 0) {
            prevMonth = 12;
            prevYear = year - 1;
        }
        const previousBudget = await this.prisma.budget.findUnique({
            where: {
                userId_month_year: {
                    userId,
                    month: prevMonth,
                    year: prevYear,
                },
            },
        });
        if (previousBudget) {
            await this.prisma.budget.create({
                data: {
                    userId,
                    amount: previousBudget.amount,
                    month,
                    year,
                    warningAt: previousBudget.warningAt,
                },
            });
        }
    }
};
exports.BudgetService = BudgetService;
exports.BudgetService = BudgetService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BudgetService);
//# sourceMappingURL=budget.service.js.map