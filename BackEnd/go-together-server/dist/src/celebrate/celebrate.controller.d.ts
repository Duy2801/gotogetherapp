import { CelebrateService } from "./celebrate.service";
import { CreateCelebrateDTO } from "./dto/celebrate.dto";
import { UpdateCelebrateDTO } from "./dto/update-celebrate.dto";
export declare class CelebrateController {
    private celebrateService;
    constructor(celebrateService: CelebrateService);
    getAllCelebration(req: any): Promise<({
        images: {
            id: string;
            createdAt: Date;
            celebrateId: string;
            imageUrl: string;
        }[];
        user: {
            id: string;
            fullName: string | null;
            avatar: string | null;
        };
        trip: {
            id: string;
            status: import("../../prisma/generated/enums").TripStatus;
            name: string;
            startDate: Date;
            endDate: Date;
            images: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        description: string | null;
        userId: string;
        tripId: string;
        date: Date;
    })[]>;
    createCelebrate(req: any, dto: CreateCelebrateDTO): Promise<{
        images: {
            id: string;
            createdAt: Date;
            celebrateId: string;
            imageUrl: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        description: string | null;
        userId: string;
        tripId: string;
        date: Date;
    }>;
    updateCelebrate(req: any, celebrateId: string, dto: UpdateCelebrateDTO): Promise<{
        images: {
            id: string;
            createdAt: Date;
            celebrateId: string;
            imageUrl: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        description: string | null;
        userId: string;
        tripId: string;
        date: Date;
    }>;
}
