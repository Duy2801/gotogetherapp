import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { TripDetailResponseDto } from "./dto/trip-detail-reponse";
import { CreateExpenseDto } from "./dto/create-expense.dto";
import { ExpenseResponseDto } from "./dto/expense-response.dto";
import { SplitType } from "prisma/generated/enums";
import { CreateTripDTO } from "./dto/create-trip-dto";
import { tripAmountQuantityResponse } from "./dto/trip-amoutQuantity-reponse";

@Injectable()
export class TripService {
  constructor(private prisma: PrismaService) {}

  private mapAdminTripSummary(trip: any, expenseTotal: number) {
    return {
      id: trip.id,
      name: trip.name,
      startDate: trip.startDate.toISOString(),
      endDate: trip.endDate.toISOString(),
      status: trip.status,
      memberCount: trip.members?.length ?? trip._count?.members ?? 0,
      expenseTotal,
      totalBudget: trip.totalBudget ? Number(trip.totalBudget) : null,
      createdAt: trip.createdAt.toISOString(),
      images: trip.images ?? null,
    };
  }

  private async syncTripStatusesForUser(userId: string) {
    const memberships = await this.prisma.tripMember.findMany({
      where: {
        userId,
        inviteStatus: "ACCEPTED",
      },
      select: {
        tripId: true,
      },
    });

    const tripIds = memberships.map((item) => item.tripId);
    if (!tripIds.length) {
      return;
    }

    const now = new Date();

    await Promise.all([
      this.prisma.trip.updateMany({
        where: {
          id: { in: tripIds },
          status: { not: "ARCHIVED" },
          startDate: { gt: now },
        },
        data: {
          status: "UPCOMING",
        },
      }),
      this.prisma.trip.updateMany({
        where: {
          id: { in: tripIds },
          status: { not: "ARCHIVED" },
          startDate: { lte: now },
          endDate: { gte: now },
        },
        data: {
          status: "ONGOING",
        },
      }),
      this.prisma.trip.updateMany({
        where: {
          id: { in: tripIds },
          status: { not: "ARCHIVED" },
          endDate: { lt: now },
        },
        data: {
          status: "COMPLETED",
        },
      }),
    ]);
  }

  async getAllTrip(
    userId: string,
    query: { status?: string; page: number; limit: number },
  ) {
    await this.syncTripStatusesForUser(userId);

    const { status, page = 1, limit = 10 } = query;
    const whereCondition: any = {
      members: {
        some: {
          userId,
        },
      },
    };
    if (status) {
      whereCondition.status = status;
    }

    const validPage = page && !isNaN(page) && page > 0 ? page : 1;
    const validLimit = limit && !isNaN(limit) && limit > 0 ? limit : 10;

    const [trips, total] = await Promise.all([
      this.prisma.trip.findMany({
        where: whereCondition,
        skip: (validPage - 1) * validLimit,
        take: validLimit,
        include: {
          members: {
            where: { userId },
            select: {
              role: true,
              inviteStatus: true,
            },
          },
          _count: {
            select: {
              members: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      this.prisma.trip.count({
        where: whereCondition,
      }),
    ]);
    return {
      trips,
      total,
      page: validPage,
      limit: validLimit,
    };
  }
  async getTripDetail(tripId: string): Promise<TripDetailResponseDto> {
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatar: true,
              },
            },
          },
        },
        expenses: {
          select: {
            amount: true,
          },
        },
      },
    });
    console.log("🔍 Trip found:", trip ? `Yes (${trip.name})` : "No");
    if (!trip) {
      throw new NotFoundException("Trip not found");
    }
    const totalExpense = trip.expenses.reduce(
      (sum, expense) => sum + Number(expense.amount),
      0,
    );

    const transformedMembers = trip.members.map((member) => ({
      id: member.id,
      userId: member.user.id,
      fullName: member.user.fullName || "",
      avatar: member.user.avatar || undefined,
      role: member.role,
      inviteStatus: member.inviteStatus,
    }));

    return {
      id: trip.id,
      name: trip.name,
      startDate: trip.startDate,
      endDate: trip.endDate,
      totalBudget: trip.totalBudget ? Number(trip.totalBudget) : undefined,
      status: trip.status,
      images: trip.images || undefined,
      createdAt: trip.createdAt,
      updatedAt: trip.updatedAt,
      members: transformedMembers,
      totalExpense,
      memberCount: trip.members.length,
    };
  }

  async createTrip(userId: string, data: CreateTripDTO) {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    endDate.setHours(23, 59, 59, 999);
    const now = new Date();

    let status: "UPCOMING" | "ONGOING" | "COMPLETED";

    if (now < startDate) {
      status = "UPCOMING";
    } else if (now >= startDate && now <= endDate) {
      status = "ONGOING";
    } else {
      status = "COMPLETED";
    }

    const trip = await this.prisma.trip.create({
      data: {
        name: data.name,
        startDate,
        endDate,
        totalBudget: data.totalBudget,
        images: data.images,
        status,
      },
    });
    await this.prisma.tripMember.create({
      data: {
        tripId: trip.id,
        userId: userId,
        role: "OWNER",
        inviteStatus: "ACCEPTED",
        joinedAt: new Date(),
      },
    });
    return trip;
  }
  async getTotalAmoutAndQuantity(
    userId: string,
  ): Promise<tripAmountQuantityResponse> {
    const [expenseResult, quantity] = await Promise.all([
      this.prisma.expense.aggregate({
        where: {
          paidById: userId,
        },
        _sum: {
          amount: true,
        },
      }),
      this.prisma.trip.count({
        where: {
          members: {
            some: {
              userId,
              inviteStatus: "ACCEPTED",
            },
          },
        },
      }),
    ]);
    return {
      amount: Number(expenseResult._sum.amount ?? 0),
      quantity,
    };
  }

  async getAdminTrips(query = "", status = "", page = 1, limit = 10) {
    const validPage = page > 0 ? page : 1;
    const validLimit = limit > 0 ? limit : 10;
    const where: any = {};
    if (query) where.name = { contains: query, mode: "insensitive" };
    if (status && status !== "ALL") where.status = status;

    const [trips, total] = await Promise.all([
      this.prisma.trip.findMany({
        where,
        skip: (validPage - 1) * validLimit,
        take: validLimit,
        orderBy: { createdAt: "desc" },
        include: {
          members: { where: { inviteStatus: "ACCEPTED" }, select: { id: true } },
          expenses: { select: { amount: true } },
        },
      }),
      this.prisma.trip.count({ where }),
    ]);

    return {
      items: trips.map((trip: any) =>
        this.mapAdminTripSummary(
          trip,
          trip.expenses.reduce((sum: number, item: any) => sum + Number(item.amount ?? 0), 0),
        ),
      ),
      total,
      page: validPage,
      limit: validLimit,
    };
  }

  async getAdminTripDetail(id: string) {
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
            paidBy: { select: { fullName: true, email: true } },
          },
          orderBy: { date: "desc" },
          take: 10,
        },
      },
    });
    if (!trip) throw new NotFoundException("Trip not found");
    const expenseTotal = trip.expenses.reduce((sum: number, item: any) => sum + Number(item.amount ?? 0), 0);

    return {
      ...this.mapAdminTripSummary(trip, expenseTotal),
      members: trip.members.map((item: any) => ({
        id: item.id,
        userId: item.userId,
        fullName: item.user?.fullName ?? "Unknown",
        avatar: item.user?.avatar ?? null,
        role: item.role,
        inviteStatus: item.inviteStatus,
      })),
      expenses: trip.expenses.map((item: any) => ({
        id: item.id,
        amount: Number(item.amount ?? 0),
        description: item.description,
        categoryName: item.category?.name ?? "Khác",
        paidByName: item.paidBy?.fullName ?? item.paidBy?.email ?? "Unknown",
        date: item.date.toISOString(),
      })),
    };
  }

  async createAdminTrip(payload: any) {
    const startDate = payload.startDate ? new Date(payload.startDate) : new Date();
    const endDate = payload.endDate ? new Date(payload.endDate) : startDate;
    const trip = await this.prisma.trip.create({
      data: {
        name: payload.name,
        startDate,
        endDate,
        totalBudget: payload.totalBudget ?? 0,
        status: payload.status,
        images: payload.images ?? null,
      },
      include: { members: { where: { inviteStatus: "ACCEPTED" }, select: { id: true } } },
    });

    return this.mapAdminTripSummary(trip, 0);
  }

  async updateAdminTrip(id: string, payload: any) {
    const trip = await this.prisma.trip.update({
      where: { id },
      data: {
        name: payload.name,
        startDate: payload.startDate ? new Date(payload.startDate) : undefined,
        endDate: payload.endDate ? new Date(payload.endDate) : undefined,
        totalBudget: payload.totalBudget ?? undefined,
        status: payload.status,
        images: payload.images ?? null,
      },
      include: { members: { where: { inviteStatus: "ACCEPTED" }, select: { id: true } } },
    });

    const expenseTotal = await this.prisma.expense.aggregate({ where: { tripId: id }, _sum: { amount: true } });
    return this.mapAdminTripSummary(trip, Number(expenseTotal._sum.amount ?? 0));
  }

  async deleteAdminTrip(id: string) {
    await this.prisma.trip.delete({ where: { id } });
    return { message: "trip.deleted" };
  }

  async deleteTrip(userId: string, tripId: string) {
    const ownerMember = await this.prisma.tripMember.findUnique({
      where: {
        tripId_userId: {
          tripId,
          userId,
        },
      },
      select: {
        role: true,
        inviteStatus: true,
      },
    });

    if (!ownerMember || ownerMember.inviteStatus !== "ACCEPTED") {
      throw new ForbiddenException("Bạn không thuộc chuyến đi này");
    }

    if (ownerMember.role !== "OWNER") {
      throw new ForbiddenException(
        "Chỉ chủ chuyến đi mới có quyền xóa chuyến đi",
      );
    }

    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      select: { id: true },
    });
    if (!trip) {
      throw new NotFoundException("Trip not found");
    }

    const expenseCount = await this.prisma.expense.count({
      where: { tripId },
    });

    if (expenseCount > 0) {
      throw new BadRequestException(
        "Không thể xóa chuyến đi khi đã có chi tiêu.",
      );
    }

    await this.prisma.trip.delete({
      where: { id: tripId },
    });

    return { message: "Đã xóa chuyến đi thành công" };
  }
}
