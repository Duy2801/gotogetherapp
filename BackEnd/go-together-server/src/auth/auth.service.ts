import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
  Injectable,
} from "@nestjs/common";
import { registerDTO } from "./dto/register.dto";
import { UserService } from "src/user/user.service";
import * as bcrypt from "bcrypt";
import { PrismaService } from "src/prisma/prisma.service";
import { RedisService } from "src/redis/redis.service";
import { InjectQueue } from "@nestjs/bull";
import type { Queue } from "bull";
import { loginDTO } from "./dto/login.dto";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { plainToInstance } from "class-transformer";
import { UserReponse } from "src/user/dto/user.reponse";
import { OAuth2Client } from "google-auth-library";
import { ChangePasswordDto } from "./dto/change-password.dto";
@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;
  constructor(
    private userService: UserService,
    private prisma: PrismaService,
    private redisservice: RedisService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectQueue("mail-queue") private mailQueue: Queue,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get("GOOGLE_CLIENT_ID"),
    );
  }

  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async register(data: registerDTO) {
    const existingUser = await this.userService.findByEmail(data.email);

    if (existingUser) {
      throw new ConflictException("auth.email_exists");
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const userRole = await this.prisma.role.findUnique({
      where: { name: "USER" },
    });

    if (!userRole) {
      throw new BadRequestException("system.internal_error");
    }

    const newUser = await this.userService.create({
      email: data.email,
      password: hashedPassword,
    });

    await this.prisma.userRole.create({
      data: {
        userId: newUser.id,
        roleId: userRole.id,
      },
    });
    const otp = this.generateOtp();

    const hashOtp = await bcrypt.hash(otp, 10);

    await this.redisservice.set(`email_otp:${newUser.email}`, otp, 3 * 60);

    await this.mailQueue.add("sent-opt", {
      email: newUser.email,
      hashOtp,
    });
    return { message: "auth.register_success" };
  }
  async login(data: loginDTO) {
    const user = await this.userService.findByEmail(data.email);
    if (!user) throw new UnauthorizedException("user not exists");

    if (user.password === null)
      throw new UnauthorizedException("password is not null");

    const match = await bcrypt.compare(data.password, user.password);

    if (!match) throw new UnauthorizedException("auth.password_incorrect");

    const accessToken = this.signAccessToken(user.id, user.email);
    const refressToken = this.signAccessToken(user.id, user.email);

    await this.redisservice.set(
      `refresh_token:${user.id}`,
      refressToken,
      7 * 24 * 60 * 60,
    );

    const userReponse = plainToInstance(UserReponse, user, {
      excludeExtraneousValues: true,
    });
    return {
      user: userReponse,
      accessToken: accessToken,
    };
  }

  private signAccessToken(userID: string, email: string) {
    return this.jwtService.sign(
      {
        sub: userID,
        email,
      },
      {
        expiresIn: "15m",
        secret: this.configService.get("JWT_SECRET"),
      },
    );
  }
  private signRefreshToken(userID: string, email: string) {
    return this.jwtService.sign(
      {
        sub: userID,
        email,
      },
      {
        expiresIn: "7d",
        secret: this.configService.get("JWT_SECRET"),
      },
    );
  }
  async logout(userId: string, deviceId?: string) {
    await this.redisservice.del(`refresh_token:${userId}`);
    if (deviceId) {
      await this.prisma.device.deleteMany({
        where: { userId, deviceId },
      });
    } else {
      await this.prisma.device.deleteMany({
        where: { userId },
      });
    }
    return {
      message: "auth.logout_success",
    };
  }

  async changePassword(userId: string, data: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, password: true },
    });

    if (!user) {
      throw new UnauthorizedException("user not exists");
    }

    if (!user.password) {
      throw new BadRequestException("auth.password_not_set");
    }

    const match = await bcrypt.compare(data.oldPassword, user.password);
    if (!match) {
      throw new BadRequestException("auth.password_incorrect");
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: "auth.password_change_success" };
  }
  async refreshToken(userId: string) {
    try {
      const key = `refresh_token:${userId}`;
      const storedToken = await this.redisservice.get(key);
      if (!storedToken) {
        throw new UnauthorizedException("auth.refresh_expried");
      }

      const payload = this.jwtService.verify(storedToken, {
        secret: this.configService.get("JWT_SECRET"),
      });
      const newAccessToken = this.signAccessToken(payload.sub, payload.email);
      return {
        status: true,
        acssToken: newAccessToken,
      };
    } catch (error) {
      throw new UnauthorizedException("auth.refresh_expried");
    }
  }

  async verifyGoogleToken(idToken: string) {
    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: this.configService.get("GOOGLE_CLIENT_ID"),
    });
    return ticket.getPayload();
  }

  async loginWithGoogle(idToken: string) {
    const payload = await this.verifyGoogleToken(idToken);

    if (!payload?.email) {
      throw new UnauthorizedException("auth.google_invalid_token");
    }
    let user = await this.prisma.user.findFirst({
      where: { OR: [{ googleId: payload.sub }, { email: payload.email }] },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: payload.email,
          fullName: payload.name,
          googleId: payload.sub,
          avatar: payload.picture,
          isVerified: payload.email_verified,
        },
      });
    }
    if (!user.googleId) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { googleId: payload.sub },
      });
    }

    const userReponse = plainToInstance(UserReponse, user, {
      excludeExtraneousValues: true,
    });

    const accessToken = this.signAccessToken(user.id, user.email);
    const refreshToken = this.signRefreshToken(user.id, user.email);

    await this.redisservice.set(
      `refresh_token:${user.id}`,
      refreshToken,
      7 * 24 * 60 * 60,
    );
    return {
      user: userReponse,
      accessToken: accessToken,
    };
  }
}
