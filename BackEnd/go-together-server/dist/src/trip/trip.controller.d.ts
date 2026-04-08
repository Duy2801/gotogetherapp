import { TripService } from "./trip.service";
import { CreateTripDTO } from "./dto/create-trip-dto";
export declare class TripController {
    private tripService;
    constructor(tripService: TripService);
    getAllTrip(req: Request, status?: string, page?: number, limit?: number): Promise<{
        trips: ({
            members: {
                role: import("../../prisma/generated/enums").MemberRole;
                inviteStatus: import("../../prisma/generated/enums").InviteStatus;
            }[];
            _count: {
                members: number;
            };
        } & {
            id: string;
            name: string;
            startDate: Date;
            endDate: Date;
            totalBudget: import("@prisma/client-runtime-utils").Decimal | null;
            status: import("../../prisma/generated/enums").TripStatus;
            createdAt: Date;
            updatedAt: Date;
            images: string | null;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    getTripDetail(tripId: string): Promise<import("./dto/trip-detail-reponse").TripDetailResponseDto>;
    createTrip(req: Request, dto: CreateTripDTO): Promise<{
        id: string;
        name: string;
        startDate: Date;
        endDate: Date;
        totalBudget: import("@prisma/client-runtime-utils").Decimal | null;
        status: import("../../prisma/generated/enums").TripStatus;
        createdAt: Date;
        updatedAt: Date;
        images: string | null;
    }>;
    getTotalAmoutAndQuantity(tripId: string): Promise<import("./dto/trip-amoutQuantity-reponse").tripAmountQuantityResponse>;
    deleteTrip(req: Request, tripId: string): Promise<{
        message: string;
    }>;
}
