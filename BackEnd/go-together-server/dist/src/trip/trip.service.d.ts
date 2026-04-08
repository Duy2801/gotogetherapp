import { PrismaService } from "src/prisma/prisma.service";
import { TripDetailResponseDto } from "./dto/trip-detail-reponse";
import { CreateTripDTO } from "./dto/create-trip-dto";
import { tripAmountQuantityResponse } from "./dto/trip-amoutQuantity-reponse";
export declare class TripService {
    private prisma;
    constructor(prisma: PrismaService);
    private syncTripStatusesForUser;
    getAllTrip(userId: string, query: {
        status?: string;
        page: number;
        limit: number;
    }): Promise<{
        trips: ({
            members: {
                role: import("prisma/generated/enums").MemberRole;
                inviteStatus: import("prisma/generated/enums").InviteStatus;
            }[];
            _count: {
                members: number;
            };
        } & {
            name: string;
            id: string;
            status: import("prisma/generated/enums").TripStatus;
            createdAt: Date;
            updatedAt: Date;
            startDate: Date;
            endDate: Date;
            totalBudget: import("@prisma/client-runtime-utils").Decimal | null;
            images: string | null;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    getTripDetail(tripId: string): Promise<TripDetailResponseDto>;
    createTrip(userId: string, data: CreateTripDTO): Promise<{
        name: string;
        id: string;
        status: import("prisma/generated/enums").TripStatus;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        endDate: Date;
        totalBudget: import("@prisma/client-runtime-utils").Decimal | null;
        images: string | null;
    }>;
    getTotalAmoutAndQuantity(userId: string): Promise<tripAmountQuantityResponse>;
    deleteTrip(userId: string, tripId: string): Promise<{
        message: string;
    }>;
}
