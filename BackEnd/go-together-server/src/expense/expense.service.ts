import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { TripMemberService } from "src/trip-member/tripmember.service";
import { NotificationGateway } from "src/notification/notification.gateway";
import { NotificationService } from "src/notification/notification.service";
import { CreateExpense } from "./dto/create-Expense.dto";

@Injectable()
export class ExpenseService {
  constructor(
    private prisma: PrismaService,
    private tripMember: TripMemberService,
    private notificationGateway: NotificationGateway,
    private notificationService: NotificationService,
  ) {}

  private mapAdminExpenseSummary(expense: any) {
    return {
      id: expense.id,
      tripId: expense.tripId,
      tripName: expense.trip?.name ?? "Unknown trip",
      tripImage: expense.trip?.images ?? null,
      amount: Number(expense.amount ?? 0),
      currency: expense.currency,
      categoryId: expense.categoryId,
      categoryName: expense.category?.name ?? "Khác",
      categoryIcon: expense.category?.icon ?? null,
      categoryColor: expense.category?.color ?? null,
      description: expense.description,
      paidById: expense.paidById,
      paidByName: expense.paidBy?.fullName ?? expense.paidBy?.email ?? "Unknown",
      paidByAvatar: expense.paidBy?.avatar ?? null,
      type: expense.type,
      date: expense.date.toISOString(),
      receipt: expense.receipt,
      isConfirmed: expense.isConfirmed,
      createdAt: expense.createdAt.toISOString(),
    };
  }

  async getExpenseCategories(userId: string, tripId: string) {
    await this.tripMember.ensureTripMember(userId, tripId);

    return this.prisma.category.findMany({
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        icon: true,
        color: true,
      },
    });
  }

  async getTripExpenses(userId: string, tripId: string, query: any) {
    await this.tripMember.ensureTripMember(userId, tripId);
    const page = query.page > 0 ? query.page : 1;
    const limit = query.limit > 0 ? query.limit : 20;

    const where: any = { tripId };
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.fromDate || query.toDate) {
      where.date = {};
      if (query.fromDate) where.date.gte = new Date(query.fromDate);
      if (query.toDate) where.date.lte = new Date(query.toDate);
    }

    const [items, total] = await Promise.all([
      this.prisma.expense.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { date: "desc" },
        include: {
          category: {
            select: { id: true, name: true, icon: true, color: true },
          },
          paidBy: { select: { id: true, fullName: true, avatar: true } },
          splits: {
            include: {
              user: { select: { id: true, fullName: true, avatar: true } },
            },
          },
        },
      }),
      this.prisma.expense.count({ where }),
    ]);

    return { expenses: items.map((x) => this.toExpenseResponse(x)), total };
  }

  private buildSplits(
    amount: number,
    splitType: "EQUAL" | "CUSTOM" | "PERCENTAGE",
    participants: string[],
    customSplits?: { userId: string; amount: number }[],
  ) {
    if (!participants?.length)
      throw new BadRequestException("participants không được rỗng");

    if (splitType === "EQUAL") {
      const per = Number((amount / participants.length).toFixed(2));
      let remaining = Number(amount.toFixed(2));
      return participants.map((userId, idx) => {
        const val =
          idx === participants.length - 1 ? Number(remaining.toFixed(2)) : per;
        remaining = Number((remaining - val).toFixed(2));
        return { userId, amount: val, splitType: "EQUAL" as const };
      });
    }

    if (splitType === "CUSTOM") {
      if (!customSplits?.length)
        throw new BadRequestException("Thiếu customSplits");
      const total = customSplits.reduce((s, x) => s + Number(x.amount), 0);
      if (Number(total.toFixed(2)) !== Number(amount.toFixed(2))) {
        throw new BadRequestException("Tổng customSplits phải bằng amount");
      }
      return customSplits.map((x) => ({
        userId: x.userId,
        amount: Number(x.amount),
        splitType: "CUSTOM" as const,
      }));
    }

    if (splitType === "PERCENTAGE") {
      if (!customSplits?.length)
        throw new BadRequestException("Thiếu customSplits cho PERCENTAGE");

      const percentageByUser = new Map(
        customSplits.map((x) => [x.userId, Number(x.amount)]),
      );

      if (percentageByUser.size !== participants.length) {
        throw new BadRequestException(
          "customSplits phải khớp số lượng participants",
        );
      }

      const totalPercent = Number(
        customSplits.reduce((s, x) => s + Number(x.amount), 0).toFixed(2),
      );

      if (Math.abs(totalPercent - 100) > 0.01) {
        throw new BadRequestException("Tổng phần trăm phải bằng 100");
      }

      let remaining = Number(amount.toFixed(2));
      return participants.map((userId, idx) => {
        const percent = percentageByUser.get(userId);

        if (percent === undefined) {
          throw new BadRequestException(
            `Thiếu phần trăm cho participant ${userId}`,
          );
        }

        const splitAmount =
          idx === participants.length - 1
            ? Number(remaining.toFixed(2))
            : Number(((amount * percent) / 100).toFixed(2));

        remaining = Number((remaining - splitAmount).toFixed(2));

        return {
          userId,
          amount: splitAmount,
          percentage: percent,
          splitType: "PERCENTAGE" as const,
        };
      });
    }

    throw new BadRequestException("splitType không hợp lệ");
  }

  async createExpense(userId: string, tripId: string, dto: CreateExpense) {
    await this.tripMember.ensureTripMember(userId, tripId);

    const amount = Number(dto.amount);
    if (!Number.isFinite(amount) || amount <= 0)
      throw new BadRequestException("amount phải > 0");

    const splits = this.buildSplits(
      amount,
      dto.splitType,
      dto.participants,
      dto.customSplits,
    );

    const created = await this.prisma.$transaction(async (tx) => {
      const expenseDate = dto.date ? new Date(dto.date) : new Date();
      const expense = await tx.expense.create({
        data: {
          tripId,
          amount,
          currency: dto.currency ?? "VND",
          categoryId: dto.categoryId,
          description: dto.description,
          paidById: dto.paidById,
          type: dto.participants.length > 1 ? "SHARED" : "PERSONAL",
          date: expenseDate,
          receipt: dto.receipt,
        },
      });

      await tx.expenseSplit.createMany({
        data: splits.map((s) => ({
          expenseId: expense.id,
          userId: s.userId,
          amount: s.amount,
          percentage: s.percentage,
          splitType: s.splitType,
        })),
      });

      return tx.expense.findUnique({
        where: { id: expense.id },
        include: {
          category: {
            select: { id: true, name: true, icon: true, color: true },
          },
          paidBy: { select: { id: true, fullName: true, avatar: true } },
          splits: {
            include: {
              user: { select: { id: true, fullName: true, avatar: true } },
            },
          },
        },
      });
    });

    if (!created) {
      throw new BadRequestException("Failed to create expense");
    }

    // Create notification for each participant who didn't pay
    const participants = created.splits || [];
    for (const split of participants) {
      if (split.userId !== created.paidById) {
        const message = `${created.paidBy.fullName} đã thêm chi phí: ${created.description}`;
        await this.notificationService.createExpenseCreatedNotification(
          split.userId,
          created.paidById,
          created.id,
          tripId,
          message,
          {
            description: created.description,
            amount: created.amount,
            paidBy: created.paidBy.fullName,
          },
        );
      }
    }

    // Emit expense created notification via socket
    this.notificationGateway.emitExpenseCreated(tripId, {
      type: "EXPENSE_CREATED",
      title: "Chi phí mới",
      message: `${created.paidBy.fullName} đã thêm chi phí: ${created.description}`,
      expenseDescription: created.description,
      amount: created.amount,
      paidBy: created.paidBy.fullName,
      expenseId: created.id,
      timestamp: new Date().toISOString(),
    });

    return this.toExpenseResponse(created);
  }

  async getAdminExpenses(query = "", tripId = "", categoryId = "", page = 1, limit = 10) {
    const validPage = page > 0 ? page : 1;
    const validLimit = limit > 0 ? limit : 10;
    const where: any = {};

    if (query) {
      where.OR = [
        { description: { contains: query, mode: "insensitive" } },
        { trip: { name: { contains: query, mode: "insensitive" } } },
        { paidBy: { fullName: { contains: query, mode: "insensitive" } } },
        { paidBy: { email: { contains: query, mode: "insensitive" } } },
      ];
    }
    if (tripId && tripId !== "ALL") where.tripId = tripId;
    if (categoryId && categoryId !== "ALL") where.categoryId = categoryId;

    const [items, total] = await Promise.all([
      this.prisma.expense.findMany({
        where,
        skip: (validPage - 1) * validLimit,
        take: validLimit,
        orderBy: { date: "desc" },
        include: {
          trip: { select: { id: true, name: true, images: true } },
          category: { select: { id: true, name: true, icon: true, color: true } },
          paidBy: { select: { id: true, fullName: true, email: true, avatar: true } },
        },
      }),
      this.prisma.expense.count({ where }),
    ]);

    return {
      items: items.map((item: any) => this.mapAdminExpenseSummary(item)),
      total,
      page: validPage,
      limit: validLimit,
    };
  }

  async createAdminExpense(payload: any) {
    const created = await this.prisma.expense.create({
      data: {
        tripId: payload.tripId,
        categoryId: payload.categoryId,
        paidById: payload.paidById,
        amount: payload.amount ?? 0,
        currency: payload.currency ?? "VND",
        description: payload.description ?? null,
        type: payload.type ?? "SHARED",
        date: payload.date ? new Date(payload.date) : new Date(),
        receipt: payload.receipt ?? null,
        isConfirmed: Boolean(payload.isConfirmed),
      },
      include: {
        trip: { select: { id: true, name: true, images: true } },
        category: { select: { id: true, name: true, icon: true, color: true } },
        paidBy: { select: { id: true, fullName: true, email: true, avatar: true } },
      },
    });

    return this.mapAdminExpenseSummary(created);
  }

  async updateAdminExpense(id: string, payload: any) {
    const updated = await this.prisma.expense.update({
      where: { id },
      data: {
        tripId: payload.tripId,
        categoryId: payload.categoryId,
        paidById: payload.paidById,
        amount: payload.amount,
        currency: payload.currency,
        description: payload.description ?? null,
        type: payload.type,
        date: payload.date ? new Date(payload.date) : undefined,
        receipt: payload.receipt ?? null,
        isConfirmed: payload.isConfirmed !== undefined ? Boolean(payload.isConfirmed) : undefined,
      },
      include: {
        trip: { select: { id: true, name: true, images: true } },
        category: { select: { id: true, name: true, icon: true, color: true } },
        paidBy: { select: { id: true, fullName: true, email: true, avatar: true } },
      },
    });

    return this.mapAdminExpenseSummary(updated);
  }

  async deleteAdminExpense(id: string) {
    await this.prisma.expenseSplit.deleteMany({ where: { expenseId: id } });
    await this.prisma.expense.delete({ where: { id } });
    return { message: "expense.deleted" };
  }

  private toExpenseResponse(expense: any) {
    return {
      id: expense.id,
      tripId: expense.tripId,
      amount: Number(expense.amount),
      currency: expense.currency,
      categoryId: expense.categoryId,
      description: expense.description ?? undefined,
      paidById: expense.paidById,
      type: expense.type,
      date: expense.date.toISOString(),
      receipt: expense.receipt ?? undefined,
      isConfirmed: expense.isConfirmed,
      createdAt: expense.createdAt.toISOString(),
      category: expense.category,
      paidBy: expense.paidBy,
      splits: expense.splits?.map((s: any) => ({
        id: s.id,
        userId: s.userId,
        amount: Number(s.amount),
        percentage: s.percentage ? Number(s.percentage) : undefined,
        splitType: s.splitType,
        isPaid: s.isPaid,
        paidAt: s.paidAt ? s.paidAt.toISOString() : undefined,
        confirmed: Boolean(s.confirmed),
        confirmedAt: s.confirmedAt ? s.confirmedAt.toISOString() : undefined,
        user: s.user,
      })),
    };
  }

  async amountPaid(userId: string) {
    const result = await this.prisma.expense.aggregate({
      where: {
        paidById: userId,
      },
      _sum: {
        amount: true,
      },
    });
    return Number(result._sum.amount ?? 0);
  }

  async getTotalDebt(userId: string) {
    const result = await this.prisma.expenseSplit.aggregate({
      where: {
        userId: userId,
        confirmed: false,
        expense: {
          paidById: {
            not: userId,
          },
        },
      },
      _sum: {
        amount: true,
      },
    });
    return Number(result._sum.amount ?? 0);
  }
  async getTotalReceived(userId: string) {
    const result = await this.prisma.expenseSplit.aggregate({
      where: {
        confirmed: false,
        userId: {
          not: userId,
        },
        expense: {
          paidById: userId,
        },
      },
      _sum: {
        amount: true,
      },
    });
    return Number(result._sum.amount ?? 0);
  }
}
