import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserRole } from "prisma/generated/client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(
    configService: ConfigService,
    public prismaService: PrismaService,
  ) {
    const jwtSecret = configService.get<string>("JWT_SECRET");
    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: { sub: string; email: string }) {
    const user = await this.prismaService.user.findUnique({
      where: { id: payload.sub },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                permissions: {
                  // Sửa ở đây
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException("user.not_found");
    }
    const permissions =
      user.userRoles?.flatMap((ur) =>
        ur.role.permissions
          ?.map((rp: any) => rp.permission?.name)
          .filter(Boolean),
      ) || [];

    return {
      sub: user.id,
      userId: user.id,
      email: user.email,
      roles: user.userRoles?.map((ur: any) => ur.role.name) || [],
      permissions,
    };
  }
}
