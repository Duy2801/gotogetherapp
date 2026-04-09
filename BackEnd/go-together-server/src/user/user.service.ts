import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { UserCreateDto } from "./dto/user-create.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(dto: UserCreateDto) {
    return await this.prisma.user.create({ data: dto });
  }
  async findByEmail(email: string) {
    return await this.prisma.user.findUnique({ where: { email } });
  }

  async findById(userId: string) {
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

  async updateProfile(userId: string, dto: UpdateUserDto) {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException("user.not_found");
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
}
