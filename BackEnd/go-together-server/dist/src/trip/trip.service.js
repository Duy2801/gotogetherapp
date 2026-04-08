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
exports.TripService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TripService = class TripService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async syncTripStatusesForUser(userId) {
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
    async getAllTrip(userId, query) {
        await this.syncTripStatusesForUser(userId);
        const { status, page = 1, limit = 10 } = query;
        const whereCondition = {
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
    async getTripDetail(tripId) {
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
            throw new common_1.NotFoundException("Trip not found");
        }
        const totalExpense = trip.expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
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
    async createTrip(userId, data) {
        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);
        endDate.setHours(23, 59, 59, 999);
        const now = new Date();
        let status;
        if (now < startDate) {
            status = "UPCOMING";
        }
        else if (now >= startDate && now <= endDate) {
            status = "ONGOING";
        }
        else {
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
    async getTotalAmoutAndQuantity(userId) {
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
    async deleteTrip(userId, tripId) {
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
            throw new common_1.ForbiddenException("Bạn không thuộc chuyến đi này");
        }
        if (ownerMember.role !== "OWNER") {
            throw new common_1.ForbiddenException("Chỉ chủ chuyến đi mới có quyền xóa chuyến đi");
        }
        const trip = await this.prisma.trip.findUnique({
            where: { id: tripId },
            select: { id: true },
        });
        if (!trip) {
            throw new common_1.NotFoundException("Trip not found");
        }
        const expenseCount = await this.prisma.expense.count({
            where: { tripId },
        });
        if (expenseCount > 0) {
            throw new common_1.BadRequestException("Không thể xóa chuyến đi khi đã có chi tiêu.");
        }
        await this.prisma.trip.delete({
            where: { id: tripId },
        });
        return { message: "Đã xóa chuyến đi thành công" };
    }
};
exports.TripService = TripService;
exports.TripService = TripService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TripService);
//# sourceMappingURL=trip.service.js.map