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
    createCelebrate(userId: string, data: CreateCelebrateDTO): Promise<{
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
    updateCelebrate(celebrateId: string, userId: string, data: UpdateCelebrateDTO): Promise<{
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
