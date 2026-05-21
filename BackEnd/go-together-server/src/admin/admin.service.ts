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

    if (!user) {
      throw new NotFoundException("user.not_found");
    }

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

    const [totalUsers, activeUsers, totalTrips, ongoingTrips, expenseSum, budgetSum, topTrips, topCategories, destinations] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { status: "ACTIVE" } }),
      this.prisma.trip.count(),
      this.prisma.trip.count({ where: { status: "ONGOING" } }),
      this.prisma.expense.aggregate({
        where: {
          date: { gte: monthStart, lt: nextMonthStart },
        },
        _sum: { amount: true },
      }),
      this.prisma.budget.aggregate({
        where: { month: targetMonth, year: targetYear },
        _sum: { amount: true },
      }),
      this.getTopTrips(monthStart, nextMonthStart),
      this.getTopCategories(monthStart, nextMonthStart),
      this.getTopDestinations(monthStart, nextMonthStart),
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
      destinations,
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

    if (status) {
      where.status = status;
    }

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (validPage - 1) * validLimit,
        take: validLimit,
        orderBy: { createdAt: "desc" },
        include: {
          userRoles: {
            include: {
              role: true,
            },
          },
        },
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

    const tripCountMap = new Map(tripCounts.map((item: any) => [item.userId, Number(item._count._all)]));
    const expenseTotalMap = new Map(expenseTotals.map((item: any) => [item.paidById, Number(item._sum.amount ?? 0)]));

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
          include: {
            trip: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        expenses: {
          include: {
            trip: { select: { name: true } },
          },
          orderBy: { date: "desc" },
          take: 5,
        },
      },
    });

    if (!user) {
      throw new NotFoundException("user.not_found");
    }

    return {
      ...this.mapUserSummary(user, user.tripMembers.filter((item: any) => item.inviteStatus === "ACCEPTED").length, user.expenses.reduce((sum: number, item: any) => sum + Number(item.amount ?? 0), 0)),
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
      select: {
        id: true,
        status: true,
      },
    });
  }

  async getTrips(status = "", page = 1, limit = 10) {
    const validPage = page > 0 ? page : 1;
    const validLimit = limit > 0 ? limit : 10;
    const where: any = {};

    if (status) {
      where.status = status;
    }

    const [items, total] = await Promise.all([
      this.prisma.trip.findMany({
        where,
        skip: (validPage - 1) * validLimit,
        take: validLimit,
        orderBy: { createdAt: "desc" },
        include: {
          members: { where: { inviteStatus: "ACCEPTED" }, select: { id: true } },
        },
      }),
      this.prisma.trip.count({ where }),
    ]);

    const tripIds = items.map((item: any) => item.id);
    const expenseTotals = await this.prisma.expense.groupBy({
      by: ["tripId"],
      where: { tripId: { in: tripIds } },
      _sum: { amount: true },
    });
    const expenseTotalMap = new Map(expenseTotals.map((item: any) => [item.tripId, Number(item._sum.amount ?? 0)]));

    return {
      items: items.map((trip: any) => ({
        id: trip.id,
        name: trip.name,
        startDate: trip.startDate.toISOString(),
        endDate: trip.endDate.toISOString(),
        status: trip.status,
        memberCount: trip.members.length,
        expenseTotal: expenseTotalMap.get(trip.id) ?? 0,
        totalBudget: trip.totalBudget ? Number(trip.totalBudget) : null,
        createdAt: trip.createdAt.toISOString(),
      })),
      total,
      page: validPage,
      limit: validLimit,
    };
  }

  async getTripDetail(id: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: { select: { id: true, fullName: true, avatar: true } },
          },
        },
        expenses: {
          include: {
            category: { select: { name: true } },
            paidBy: { select: { fullName: true } },
          },
          orderBy: { date: "desc" },
        },
      },
    });

    if (!trip) {
      throw new NotFoundException("trip.not_found");
    }

    return {
      id: trip.id,
      name: trip.name,
      startDate: trip.startDate.toISOString(),
      endDate: trip.endDate.toISOString(),
      status: trip.status,
      memberCount: trip.members.filter((item: any) => item.inviteStatus === "ACCEPTED").length,
      expenseTotal: trip.expenses.reduce((sum: number, item: any) => sum + Number(item.amount ?? 0), 0),
      totalBudget: trip.totalBudget ? Number(trip.totalBudget) : null,
      createdAt: trip.createdAt.toISOString(),
      images: trip.images,
      members: trip.members.map((item: any) => ({
        id: item.id,
        userId: item.userId,
        fullName: item.user?.fullName ?? "Người dùng",
        avatar: item.user?.avatar ?? null,
        role: item.role,
        inviteStatus: item.inviteStatus,
      })),
      expenses: trip.expenses.map((item: any) => ({
        id: item.id,
        amount: Number(item.amount ?? 0),
        description: item.description,
        categoryName: item.category?.name ?? "Khác",
        paidByName: item.paidBy?.fullName ?? "Người dùng",
        date: item.date.toISOString(),
      })),
    };
  }

  async getCategories() {
    const categories = await this.prisma.category.findMany({
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    });
    const categoryIds = categories.map((item: any) => item.id);
    const expenseStats = await this.prisma.expense.groupBy({
      by: ["categoryId"],
      where: { categoryId: { in: categoryIds } },
      _sum: { amount: true },
      _count: { _all: true },
    });
    const statMap = new Map(expenseStats.map((item: any) => [item.categoryId, item]));

    return categories.map((category: any) => ({
      id: category.id,
      name: category.name,
      icon: category.icon,
      color: category.color,
      isDefault: category.isDefault,
      expenseCount: Number(statMap.get(category.id)?._count?._all ?? 0),
      totalAmount: Number(statMap.get(category.id)?._sum?.amount ?? 0),
    }));
  }

  async createCategory(payload: any) {
    return this.prisma.category.create({
      data: {
        name: payload.name,
        icon: payload.icon ?? null,
        color: payload.color ?? null,
        isDefault: Boolean(payload.isDefault),
      },
    });
  }

  async updateCategory(id: string, payload: any) {
    return this.prisma.category.update({
      where: { id },
      data: {
        name: payload.name,
        icon: payload.icon ?? null,
        color: payload.color ?? null,
        isDefault: payload.isDefault !== undefined ? Boolean(payload.isDefault) : undefined,
      },
    });
  }

  async deleteCategory(id: string) {
    await this.prisma.category.delete({ where: { id } });
    return { message: `mock:${id}:deleted` };
  }

  async getDestinations() {
    const trips = await this.prisma.trip.findMany({
      orderBy: { createdAt: "desc" },
      include: { expenses: true },
    });

    const destinationMap = new Map<string, any>();

    for (const trip of trips as any[]) {
      const label = trip.name;
      const current = destinationMap.get(label) ?? {
        id: label,
        label,
        tripCount: 0,
        totalExpense: 0,
        latestTripAt: null,
        topTrips: [],
      };
      const expenseTotal = trip.expenses.reduce((sum: number, item: any) => sum + Number(item.amount ?? 0), 0);

      current.tripCount += 1;
      current.totalExpense += expenseTotal;
      current.latestTripAt = !current.latestTripAt || new Date(trip.createdAt).getTime() > new Date(current.latestTripAt).getTime() ? trip.createdAt.toISOString() : current.latestTripAt;
      current.topTrips.push({
        id: trip.id,
        name: trip.name,
        status: trip.status,
        totalExpense: expenseTotal,
      });
      destinationMap.set(label, current);
    }

    return Array.from(destinationMap.values())
      .map((item: any) => ({
        ...item,
        topTrips: item.topTrips.sort((left: any, right: any) => right.totalExpense - left.totalExpense).slice(0, 3),
      }))
      .sort((left: any, right: any) => right.totalExpense - left.totalExpense);
  }

  async getDestinationDetail(id: string) {
    const destinations = await this.getDestinations();
    const destination = destinations.find((item: any) => item.id === id || item.label === id);
    if (!destination) {
      throw new NotFoundException("destination.not_found");
    }
    return destination;
  }

  getSettings() {
    return inMemorySettings;
  }

  saveSettings(payload: Partial<AppSettings>) {
    inMemorySettings = {
      ...inMemorySettings,
      ...payload,
    };

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
      where: {
        date: { gte: monthStart, lt: nextMonthStart },
      },
      _sum: { amount: true },
    });

    if (!tripTotals.length) {
      return [];
    }

    const tripIds = tripTotals.map((item: any) => item.tripId);
    const trips = await this.prisma.trip.findMany({
      where: { id: { in: tripIds } },
      select: { id: true, name: true, status: true },
    });
    const tripMap = new Map(trips.map((item: any) => [item.id, item]));

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
      where: {
        date: { gte: monthStart, lt: nextMonthStart },
      },
      _sum: { amount: true },
    });

    if (!stats.length) {
      return [];
    }

    const categories = await this.prisma.category.findMany({
      where: { id: { in: stats.map((item: any) => item.categoryId) } },
      select: { id: true, name: true, color: true },
    });
    const categoryMap = new Map(categories.map((item: any) => [item.id, item]));

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

  private async getTopDestinations(monthStart: Date, nextMonthStart: Date) {
    const trips = await this.prisma.trip.findMany({
      select: { id: true, name: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    const tripIds = trips.map((item: any) => item.id);
    const stats = await this.prisma.expense.groupBy({
      by: ["tripId"],
      where: {
        tripId: { in: tripIds },
        date: { gte: monthStart, lt: nextMonthStart },
      },
      _sum: { amount: true },
    });
    const expenseMap = new Map(stats.map((item: any) => [item.tripId, Number(item._sum.amount ?? 0)]));

    const destinationMap = new Map<string, any>();
    for (const trip of trips as any[]) {
      const label = trip.name;
      const current = destinationMap.get(label) ?? {
        id: label,
        label,
        tripCount: 0,
        totalExpense: 0,
        latestTripAt: null,
        topTrips: [],
      };
      const expenseTotal = expenseMap.get(trip.id) ?? 0;
      current.tripCount += 1;
      current.totalExpense += expenseTotal;
      current.latestTripAt = !current.latestTripAt || new Date(trip.createdAt).getTime() > new Date(current.latestTripAt).getTime() ? trip.createdAt.toISOString() : current.latestTripAt;
      current.topTrips.push({
        id: trip.id,
        name: trip.name,
        status: "UPCOMING",
        totalExpense: expenseTotal,
      });
      destinationMap.set(label, current);
    }

    return Array.from(destinationMap.values())
      .map((item: any) => ({
        ...item,
        topTrips: item.topTrips.sort((left: any, right: any) => right.totalExpense - left.totalExpense).slice(0, 3),
      }))
      .sort((left: any, right: any) => right.totalExpense - left.totalExpense)
      .slice(0, 3);
  }
}