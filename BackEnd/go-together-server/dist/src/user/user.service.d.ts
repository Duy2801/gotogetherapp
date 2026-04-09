import { PrismaService } from "src/prisma/prisma.service";
import { UserCreateDto } from "./dto/user-create.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
export declare class UserService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: UserCreateDto): Promise<{
        fullName: string | null;
        dateOfBirth: Date | null;
        gender: number | null;
        avatar: string | null;
        id: string;
        email: string;
        password: string | null;
        status: import("../../prisma/generated/enums").UserStatus;
        isVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
        googleId: string | null;
    }>;
    findByEmail(email: string): Promise<{
        fullName: string | null;
        dateOfBirth: Date | null;
        gender: number | null;
        avatar: string | null;
        id: string;
        email: string;
        password: string | null;
        status: import("../../prisma/generated/enums").UserStatus;
        isVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
        googleId: string | null;
    } | null>;
    findById(userId: string): Promise<{
        fullName: string | null;
        dateOfBirth: Date | null;
        gender: number | null;
        avatar: string | null;
        id: string;
        email: string;
        status: import("../../prisma/generated/enums").UserStatus;
        isVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    updateProfile(userId: string, dto: UpdateUserDto): Promise<{
        fullName: string | null;
        dateOfBirth: Date | null;
        gender: number | null;
        avatar: string | null;
        id: string;
        email: string;
        status: import("../../prisma/generated/enums").UserStatus;
        isVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
