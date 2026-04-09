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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let UserService = class UserService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        return await this.prisma.user.create({ data: dto });
    }
    async findByEmail(email) {
        return await this.prisma.user.findUnique({ where: { email } });
    }
    async findById(userId) {
        return await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                fullName: true,
                dateOfBirth: true,
                gender: true,
                avatar: true,
                status: true,
                isVerified: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }
    async updateProfile(userId, dto) {
        const user = await this.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException("user.not_found");
        }
        return await this.prisma.user.update({
            where: { id: userId },
            data: {
                ...(dto.fullName !== undefined && { fullName: dto.fullName }),
                ...(dto.dateOfBirth !== undefined && {
                    dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
                }),
                ...(dto.gender !== undefined && { gender: dto.gender }),
                ...(dto.avatar !== undefined && { avatar: dto.avatar }),
            },
            select: {
                id: true,
                email: true,
                fullName: true,
                dateOfBirth: true,
                gender: true,
                avatar: true,
                status: true,
                isVerified: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserService);
//# sourceMappingURL=user.service.js.map