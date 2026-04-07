import { PrismaService } from "@/prisma/prisma.service";
import { ForbiddenException, Injectable } from "@nestjs/common";
import {
  CategorySpendingItemDto,
  SpendingStatisticsResponseDto,
  TripSpendingItemDto,
} from "./dto/spending-statistics.dto";

@Injectable()
export class StatisticsService {
  constructor(private prisma: PrismaService) {}

  async getSpendingStatistics(
    userId: string,
    tripId?: string,
    month?: number,
    year?: number,
  ): Promise<SpendingStatisticsResponseDto> {
    const now = new Date();
    const targetMonth =
      Number.isFinite(Number(month)) &&
      Number(month) >= 1 &&
      Number(month) <= 12
        ? Number(month)
        : now.getMonth() + 1;
    const targetYear =
      Number.isFinite(Number(year)) && Number(year) >= 2000
        ? Number(year)
        : now.getFullYear();

    const monthStart = new Date(targetYear, targetMonth - 1, 1);
    const nextMonthStart = new Date(targetYear, targetMonth, 1);

    const memberships = await this.prisma.tripMember.findMany({
      where: {
        userId,
        inviteStatus: "ACCEPTED",
      },
      select: {
        tripId: true,
        trip: {
          select: {
            name: true,
            startDate: true,
          },
        },
      },
    });

    if (!memberships.length) {
      return {
        month: targetMonth,
        year: targetYear,
        monthLabel: `${targetMonth}/${targetYear}`,
        totalAcrossTrips: 0,
        trips: [] as TripSpendingItemDto[],
        selectedTripId: null,
        categories: [] as CategorySpendingItemDto[],
      };
    }

    const tripIds = memberships.map((member) => member.tripId);
    const tripNameMap = new Map(
      memberships.map((member) => [member.tripId, member.trip.name]),
    );

    const [tripTotals, tripExpenseCounts] = await Promise.all([
      this.prisma.expense.groupBy({
        by: ["tripId"],
        where: {
          tripId: {
            in: tripIds,
          },
          date: {
            gte: monthStart,
            lt: nextMonthStart,
          },
        },
        _sum: {
          amount: true,
        },
      }),
      this.prisma.expense.groupBy({
        by: ["tripId"],
        where: {
          tripId: {
            in: tripIds,
          },
          date: {
            gte: monthStart,
            lt: nextMonthStart,
          },
        },
        _count: {
          _all: true,
        },
      }),
    ]);

    const amountMap = new Map(
      tripTotals.map((item) => [item.tripId, Number(item._sum.amount ?? 0)]),
    );
    const countMap = new Map(
      tripExpenseCounts.map((item) => [item.tripId, Number(item._count._all)]),
    );

    const trips: TripSpendingItemDto[] = memberships
      .map((member) => ({
        tripId: member.tripId,
        tripName: member.trip.name || "Chuyến đi",
        totalAmount: amountMap.get(member.tripId) ?? 0,
        expenseCount: countMap.get(member.tripId) ?? 0,
      }))
      .sort((left, right) => {
        const leftDate = new Date(
          memberships.find((item) => item.tripId === left.tripId)?.trip
            .startDate ?? 0,
        ).getTime();
        const rightDate = new Date(
          memberships.find((item) => item.tripId === right.tripId)?.trip
            .startDate ?? 0,
        ).getTime();

        if (leftDate !== rightDate) {
          return leftDate - rightDate;
        }

        return right.totalAmount - left.totalAmount;
      });

    const selectedTripId = tripId || trips[0]?.tripId || null;
    const isTripAllowed = !selectedTripId || tripIds.includes(selectedTripId);

    if (!isTripAllowed) {
      throw new ForbiddenException("Bạn không có quyền truy cập chuyến đi này");
    }

    const totalAcrossTrips = trips.reduce(
      (sum, item) => sum + item.totalAmount,
      0,
    );

    if (!selectedTripId) {
      return {
        month: targetMonth,
        year: targetYear,
        monthLabel: `${targetMonth}/${targetYear}`,
        totalAcrossTrips,
        trips,
        selectedTripId: null,
        categories: [] as CategorySpendingItemDto[],
      };
    }

    const categoryStats = await this.prisma.expense.groupBy({
      by: ["categoryId"],
      where: {
        tripId: selectedTripId,
        date: {
          gte: monthStart,
          lt: nextMonthStart,
        },
      },
      _sum: {
        amount: true,
      },
      _count: {
        _all: true,
      },
    });

    if (!categoryStats.length) {
      return {
        month: targetMonth,
        year: targetYear,
        monthLabel: `${targetMonth}/${targetYear}`,
        totalAcrossTrips,
        trips,
        selectedTripId,
        categories: [] as CategorySpendingItemDto[],
      };
    }

    const categoryIds = categoryStats.map((item) => item.categoryId);
    const categories = await this.prisma.category.findMany({
      where: {
        id: {
          in: categoryIds,
        },
      },
      select: {
        id: true,
        name: true,
        icon: true,
        color: true,
      },
    });

    const categoryMap = new Map(categories.map((item) => [item.id, item]));
    const selectedTripTotal =
      trips.find((item) => item.tripId === selectedTripId)?.totalAmount ?? 0;

    const categoryItems: CategorySpendingItemDto[] = categoryStats
      .map((item) => {
        const category = categoryMap.get(item.categoryId);
        const amount = Number(item._sum.amount ?? 0);
        const percentage =
          selectedTripTotal > 0
            ? Number(((amount / selectedTripTotal) * 100).toFixed(2))
            : 0;

        return {
          categoryId: item.categoryId,
          categoryName: category?.name || "Khác",
          color: category?.color || null,
          icon: category?.icon || null,
          totalAmount: amount,
          expenseCount: Number(item._count._all),
          percentage,
        };
      })
      .sort((left, right) => right.totalAmount - left.totalAmount);

    return {
      month: targetMonth,
      year: targetYear,
      monthLabel: `${targetMonth}/${targetYear}`,
      totalAcrossTrips,
      trips,
      selectedTripId,
      categories: categoryItems,
    };
  }
}
