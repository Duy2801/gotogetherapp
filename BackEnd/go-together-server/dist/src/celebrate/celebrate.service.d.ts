import { PrismaService } from "src/prisma/prisma.service";
import { CreateCelebrateDTO } from "./dto/celebrate.dto";
import { UpdateCelebrateDTO } from "./dto/update-celebrate.dto";
export declare class CelebrateService {
    private prisma;
    constructor(prisma: PrismaService);
    getAllCelebrate(userId: string): Promise<({
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
    })[]>;
    createCelebrate(userId: string, data: CreateCelebrateDTO): Promise<{
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
    updateCelebrate(celebrateId: string, userId: string, data: UpdateCelebrateDTO): Promise<{
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
