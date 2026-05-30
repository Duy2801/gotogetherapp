import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

type AppSettings = {
  language: string;
  timezone: string;
  reportMode: string;
  notificationsEnabled: boolean;
  autoLockMinutes: number;
  currency: string;
};

type TripSummary = {
  id: string;
  name: string;
  status: string;
};

type CategoryColorSummary = {
  id: string;
  name: string;
  color: string | null;
};

const defaultSettings: AppSettings = {
  language: "vi",
  timezone: "Asia/Ho_Chi_Minh",
  reportMode: "monthly",
  notificationsEnabled: true,
  autoLockMinutes: 15,
  currency: "VND",
};

let inMemorySettings: AppSettings = { ...defaultSettings };

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatar: true,
        status: true,
        isVerified: true,
        userRoles: {
          select: {
            role: {
              select: {
                name: true,
                permissions: {
                  select: {
                    permission: {
                      select: { name: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) throw new NotFoundException("user.not_found");

    const roles = user.userRoles.map((item: any) => item.role.name).filter(Boolean);
    const permissions = user.userRoles.flatMap((item: any) =>
      item.role.permissions.map((relation: any) => relation.permission?.name).filter(Boolean),
    );

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      avatar: user.avatar,
      status: user.status,
      isVerified: user.isVerified,
      roles,
      permissions,
    };
  }

  private parsePeriod(month?: number, year?: number) {
    const now = new Date();
    const targetMonth = Number.isFinite(Number(month)) && Number(month) >= 1 && Number(month) <= 12 ? Number(month) : now.getMonth() + 1;
    const targetYear = Number.isFinite(Number(year)) && Number(year) >= 2000 ? Number(year) : now.getFullYear();
    const monthStart = new Date(targetYear, targetMonth - 1, 1);
    const nextMonthStart = new Date(targetYear, targetMonth, 1);

    return { targetMonth, targetYear, monthStart, nextMonthStart };
  }

  async getDashboard(month?: number, year?: number) {
    const { targetMonth, targetYear, monthStart, nextMonthStart } = this.parsePeriod(month, year);

    const [totalUsers, activeUsers, totalTrips, ongoingTrips, expenseSum, budgetSum, topTrips, topCategories] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { status: "ACTIVE" } }),
      this.prisma.trip.count(),
      this.prisma.trip.count({ where: { status: "ONGOING" } }),
      this.prisma.expense.aggregate({
        where: { date: { gte: monthStart, lt: nextMonthStart } },
        _sum: { amount: true },
      }),
      this.prisma.budget.aggregate({
        where: { month: targetMonth, year: targetYear },
        _sum: { amount: true },
      }),
      this.getTopTrips(monthStart, nextMonthStart),
      this.getTopCategories(monthStart, nextMonthStart),
    ]);

    return {
      month: targetMonth,
      year: targetYear,
      totalUsers,
      activeUsers,
      totalTrips,
      ongoingTrips,
      totalExpenses: Number(expenseSum._sum.amount ?? 0),
      totalBudget: Number(budgetSum._sum.amount ?? 0),
      topTrips,
      topCategories,
    };
  }

  async getUsers(query = "", page = 1, limit = 10, status = "") {
    const validPage = page > 0 ? page : 1;
    const validLimit = limit > 0 ? limit : 10;
    const where: any = {};

    if (query) {
      where.OR = [
        { email: { contains: query, mode: "insensitive" } },
        { fullName: { contains: query, mode: "insensitive" } },
      ];
    }

    if (status && status !== "ALL") where.status = status;

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (validPage - 1) * validLimit,
        take: validLimit,
        orderBy: { createdAt: "desc" },
        include: { userRoles: { include: { role: true } } },
      }),
      this.prisma.user.count({ where }),
    ]);

    const userIds = items.map((item: any) => item.id);
    const [tripCounts, expenseTotals] = await Promise.all([
      this.prisma.tripMember.groupBy({
        by: ["userId"],
        where: { userId: { in: userIds }, inviteStatus: "ACCEPTED" },
        _count: { _all: true },
      }),
      this.prisma.expense.groupBy({
        by: ["paidById"],
        where: { paidById: { in: userIds } },
        _sum: { amount: true },
      }),
    ]);

    const tripCountMap = new Map<string, number>(
      tripCounts.map((item: any) => [item.userId, Number(item._count._all)]),
    );
    const expenseTotalMap = new Map<string, number>(
      expenseTotals.map((item: any) => [item.paidById, Number(item._sum.amount ?? 0)]),
    );

    return {
      items: items.map((user: any) => this.mapUserSummary(user, tripCountMap.get(user.id) ?? 0, expenseTotalMap.get(user.id) ?? 0)),
      total,
      page: validPage,
      limit: validLimit,
    };
  }

  async getUserDetail(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        userRoles: { include: { role: true } },
        tripMembers: {
          include: { trip: { select: { id: true, name: true } } },
          orderBy: { createdAt: "desc" },
        },
        expenses: {
          include: { trip: { select: { name: true } } },
          orderBy: { date: "desc" },
          take: 5,
        },
      },
    });

    if (!user) throw new NotFoundException("user.not_found");

    return {
      ...this.mapUserSummary(
        user,
        user.tripMembers.filter((item: any) => item.inviteStatus === "ACCEPTED").length,
        user.expenses.reduce((sum: number, item: any) => sum + Number(item.amount ?? 0), 0),
      ),
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.toISOString() : null,
      gender: user.gender,
      joinedTrips: user.tripMembers.map((item: any) => ({
        id: item.id,
        tripId: item.tripId,
        tripName: item.trip?.name ?? "Chuyến đi",
        role: item.role,
        inviteStatus: item.inviteStatus,
      })),
      recentExpenses: user.expenses.map((item: any) => ({
        id: item.id,
        tripName: item.trip?.name ?? "Chuyến đi",
        amount: Number(item.amount ?? 0),
        description: item.description,
        date: item.date.toISOString(),
      })),
    };
  }

  async updateUserStatus(id: string, status: string) {
    return this.prisma.user.update({
      where: { id },
      data: { status },
      select: { id: true, status: true },
    });
  }

  async createUser(payload: any) {
    const created = await this.prisma.user.create({
      data: {
        email: payload.email,
        fullName: payload.fullName ?? null,
        avatar: payload.avatar ?? null,
        status: payload.status || "ACTIVE",
        isVerified: Boolean(payload.isVerified),
        dateOfBirth: payload.dateOfBirth ? new Date(payload.dateOfBirth) : null,
        gender: payload.gender === "" || payload.gender === undefined ? null : Number(payload.gender),
      },
      include: { userRoles: { include: { role: true } } },
    });

    return this.mapUserSummary(created, 0, 0);
  }

  async updateUser(id: string, payload: any) {
    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        email: payload.email,
        fullName: payload.fullName ?? null,
        avatar: payload.avatar ?? null,
        status: payload.status,
        isVerified: payload.isVerified === undefined ? undefined : Boolean(payload.isVerified),
        dateOfBirth: payload.dateOfBirth ? new Date(payload.dateOfBirth) : null,
        gender: payload.gender === "" || payload.gender === undefined ? null : Number(payload.gender),
      },
      include: { userRoles: { include: { role: true } } },
    });

    const [tripCount, expenseTotal] = await Promise.all([
      this.prisma.tripMember.count({ where: { userId: id, inviteStatus: "ACCEPTED" } }),
      this.prisma.expense.aggregate({ where: { paidById: id }, _sum: { amount: true } }),
    ]);

    return this.mapUserSummary(updated, tripCount, Number(expenseTotal._sum.amount ?? 0));
  }

  async deleteUser(id: string) {
    await this.prisma.$transaction(async (tx: any) => {
      const expenses = await tx.expense.findMany({ where: { paidById: id }, select: { id: true } });
      const expenseIds = expenses.map((item: any) => item.id);
      await tx.notification.deleteMany({ where: { OR: [{ userId: id }, { senderId: id }] } });
      await tx.device.deleteMany({ where: { userId: id } });
      await tx.budget.deleteMany({ where: { userId: id } });
      await tx.userRole.deleteMany({ where: { userId: id } });
      await tx.expenseSplit.deleteMany({ where: { OR: [{ userId: id }, { expenseId: { in: expenseIds } }] } });
      await tx.expense.deleteMany({ where: { paidById: id } });
      await tx.celebrateReaction.deleteMany({ where: { userId: id } });
      await tx.celebrateComment.deleteMany({ where: { userId: id } });
      await tx.celebrate.deleteMany({ where: { userId: id } });
      await tx.tripMember.deleteMany({ where: { userId: id } });
      await tx.user.delete({ where: { id } });
    });

    return { message: "user.deleted" };
  }

  getSettings() {
    return inMemorySettings;
  }

  saveSettings(payload: Partial<AppSettings>) {
    inMemorySettings = { ...inMemorySettings, ...payload };
    return inMemorySettings;
  }

  private mapUserSummary(user: any, tripCount: number, expenseTotal: number) {
    const roles = user.userRoles?.map((item: any) => item.role?.name).filter(Boolean) ?? [];

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      avatar: user.avatar,
      status: user.status,
      isVerified: user.isVerified,
      roles,
      tripCount,
      expenseTotal,
      createdAt: user.createdAt.toISOString(),
    };
  }

  private async getTopTrips(monthStart: Date, nextMonthStart: Date) {
    const tripTotals = await this.prisma.expense.groupBy({
      by: ["tripId"],
      where: { date: { gte: monthStart, lt: nextMonthStart } },
      _sum: { amount: true },
    });

    if (!tripTotals.length) return [];

    const tripIds = tripTotals.map((item: any) => item.tripId);
    const trips = await this.prisma.trip.findMany({
      where: { id: { in: tripIds } },
      select: { id: true, name: true, status: true },
    });
    const tripMap = new Map<string, TripSummary>(
      trips.map((item: any) => [item.id, item]),
    );

    return tripTotals
      .map((item: any) => ({
        id: item.tripId,
        name: tripMap.get(item.tripId)?.name ?? "Chuyến đi",
        status: tripMap.get(item.tripId)?.status ?? "UPCOMING",
        members: 0,
        expenseTotal: Number(item._sum.amount ?? 0),
      }))
      .sort((left: any, right: any) => right.expenseTotal - left.expenseTotal)
      .slice(0, 3);
  }

  private async getTopCategories(monthStart: Date, nextMonthStart: Date) {
    const stats = await this.prisma.expense.groupBy({
      by: ["categoryId"],
      where: { date: { gte: monthStart, lt: nextMonthStart } },
      _sum: { amount: true },
    });

    if (!stats.length) return [];

    const categories = await this.prisma.category.findMany({
      where: { id: { in: stats.map((item: any) => item.categoryId) } },
      select: { id: true, name: true, color: true },
    });
    const categoryMap = new Map<string, CategoryColorSummary>(
      categories.map((item: any) => [item.id, item]),
    );

    return stats
      .map((item: any) => ({
        id: item.categoryId,
        name: categoryMap.get(item.categoryId)?.name ?? "Khác",
        color: categoryMap.get(item.categoryId)?.color ?? null,
        totalAmount: Number(item._sum.amount ?? 0),
      }))
      .sort((left: any, right: any) => right.totalAmount - left.totalAmount)
      .slice(0, 3);
  }
}
