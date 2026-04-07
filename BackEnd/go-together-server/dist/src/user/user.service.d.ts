import { PrismaService } from "src/prisma/prisma.service";
import { UserCreateDto } from "./dto/user-create.dto";
export declare class UserService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: UserCreateDto): Promise<{
        password: string | null;
        id: string;
        email: string;
        fullName: string | null;
        dateOfBirth: Date | null;
        gender: number | null;
        status: import("../../prisma/generated/enums").UserStatus;
        isVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
        googleId: string | null;
        avatar: string | null;
    }>;
    findByEmail(email: string): Promise<{
        password: string | null;
        id: string;
        email: string;
        fullName: string | null;
        dateOfBirth: Date | null;
        gender: number | null;
        status: import("../../prisma/generated/enums").UserStatus;
        isVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
        googleId: string | null;
        avatar: string | null;
    } | null>;
}
