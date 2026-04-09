import { UserCreateDto } from "./dto/user-create.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserService } from "./user.service";
export declare class UserController {
    private userService;
    constructor(userService: UserService);
    create(dto: UserCreateDto): void;
    getMe(req: any): Promise<{
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
    updateMe(req: any, dto: UpdateUserDto): Promise<{
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
