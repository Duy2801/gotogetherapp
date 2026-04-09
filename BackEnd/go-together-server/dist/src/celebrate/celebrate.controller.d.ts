import { CelebrateService } from "./celebrate.service";
import { CreateCelebrateDTO } from "./dto/celebrate.dto";
import { UpdateCelebrateDTO } from "./dto/update-celebrate.dto";
export declare class CelebrateController {
    private celebrateService;
    constructor(celebrateService: CelebrateService);
    getAllCelebration(req: any): Promise<({
        user: {
            id: string;
            fullName: string | null;
            avatar: string | null;
        };
        trip: {
            name: string;
            id: string;
            status: import("../../prisma/generated/enums").TripStatus;
            startDate: Date;
            endDate: Date;
            images: string | null;
        };
        images: {
            id: string;
            createdAt: Date;
            imageUrl: string;
            celebrateId: string;
        }[];
    } & {
        description: string | null;
        id: string;
        createdAt: Date;
        userId: string;
        date: Date;
        tripId: string;
    })[]>;
    createCelebrate(req: any, dto: CreateCelebrateDTO): Promise<{
        images: {
            id: string;
            createdAt: Date;
            imageUrl: string;
            celebrateId: string;
        }[];
    } & {
        description: string | null;
        id: string;
        createdAt: Date;
        userId: string;
        date: Date;
        tripId: string;
    }>;
    updateCelebrate(req: any, celebrateId: string, dto: UpdateCelebrateDTO): Promise<{
        images: {
            id: string;
            createdAt: Date;
            imageUrl: string;
            celebrateId: string;
        }[];
    } & {
        description: string | null;
        id: string;
        createdAt: Date;
        userId: string;
        date: Date;
        tripId: string;
    }>;
}
