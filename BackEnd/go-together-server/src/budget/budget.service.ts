import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateBudgetDto } from "./dto/create-budget.dto";
import { UpdateBudgetDto } from "./dto/update-budget.dto";

@Injectable()
export class BudgetService {
  constructor(private prisma: PrismaService) {}

  async createBudget(userId: string, dto: CreateBudgetDto): Promise<any> {
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

  async updateBudget(
    budgetId: string,
    userId: string,
    dto: UpdateBudgetDto,
  ): Promise<any> {
    const budget = await this.prisma.budget.findFirst({
      where: {
        id: budgetId,
        userId: userId,
      },
    });

    if (!budget) {
      throw new NotFoundException("Budget not found or not yours");
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

  async getBudgetByMonth(
    userId: string,
    month?: number,
    year?: number,
  ): Promise<any> {
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

    // Tính tổng tiền đã chi trong tháng
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

  async autoCreateMonthlyBudget(
    userId: string,
    month: number,
    year: number,
  ): Promise<void> {
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
}
