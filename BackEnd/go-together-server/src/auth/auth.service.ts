import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { plainToInstance } from "class-transformer";
import { OAuth2Client } from "google-auth-library";
import nodemailer from "nodemailer";
import { createHash, randomInt } from "crypto";
import { PrismaService } from "src/prisma/prisma.service";
import { RedisService } from "src/redis/redis.service";
import { UserService } from "src/user/user.service";
import { UserReponse } from "src/user/dto/user.reponse";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { ForgotPasswordRequestDto } from "./dto/forgot-password-request.dto";
import { loginDTO } from "./dto/login.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { registerDTO } from "./dto/register.dto";
import { ResendOtpDto } from "./dto/resend-otp.dto";
import { ResetPasswordOtpDto } from "./dto/reset-password-otp.dto";
import { VerifyRegistrationOtpDto } from "./dto/verify-registration-otp.dto";

type PendingRegistrationPayload = {
  email: string;
  fullName?: string;
  passwordHash: string;
  otpHash: string;
  attempts: number;
};

type PasswordResetPayload = {
  email: string;
  otpHash: string;
  attempts: number;
};

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class AuthService {
  private readonly googleClient: OAuth2Client | null;

  constructor(
    private userService: UserService,
    private prisma: PrismaService,
    private redisservice: RedisService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    const googleClientId = this.configService.get<string>("GOOGLE_CLIENT_ID");
    const googleClientSecret = this.configService.get<string>(
      "GOOGLE_CLIENT_SECRET",
    );
    const googleCallbackUrl = this.getGoogleCallbackUrl();

    if (googleClientId) {
      this.googleClient = new OAuth2Client(
        googleClientId,
        googleClientSecret ?? undefined,
        googleCallbackUrl ?? undefined,
      );
    } else {
      this.googleClient = null;
    }
  }

  generateOtp(): string {
    return randomInt(100000, 1000000).toString();
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private getPendingRegistrationKey(email: string): string {
    return `auth:pending-registration:${this.normalizeEmail(email)}`;
  }

  private getRegistrationResendKey(email: string): string {
    return `auth:pending-registration-resend:${this.normalizeEmail(email)}`;
  }

  private getPasswordResetKey(email: string): string {
    return `auth:password-reset:${this.normalizeEmail(email)}`;
  }

  private getPasswordResetResendKey(email: string): string {
    return `auth:password-reset-resend:${this.normalizeEmail(email)}`;
  }

  private getRefreshTokenKey(userId: string): string {
    return `auth:refresh-token:${userId}`;
  }

  private getGoogleCallbackUrl(): string | undefined {
    return (
      this.configService.get<string>("GOOGLE_CALLBACK_URL") ??
      this.configService.get<string>("GOOGLE_REDIRECT_URI")
    );
  }

  private getGoogleClientOrFail(): OAuth2Client {
    if (!this.googleClient) {
      throw new BadRequestException("auth.google_config_missing");
    }

    return this.googleClient;
  }

  private hashRefreshToken(refreshToken: string): string {
    return createHash("sha256").update(refreshToken).digest("hex");
  }

  private async processGoogleIdToken(idToken: string) {
    const client = this.getGoogleClientOrFail();

    const ticket = await client.verifyIdToken({
      idToken,
      audience: this.configService.get<string>("GOOGLE_CLIENT_ID"),
    });

    const payload = ticket.getPayload();

    if (!payload?.email) {
      throw new UnauthorizedException("auth.google_invalid_token");
    }

    const email = this.normalizeEmail(payload.email);
    let user = await this.prisma.user.findFirst({
      where: { OR: [{ googleId: payload.sub }, { email }] },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          fullName: payload.name,
          googleId: payload.sub,
          avatar: payload.picture,
          isVerified: Boolean(payload.email_verified),
        },
      });
    }

    if (!user.googleId) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { googleId: payload.sub },
      });
    }

    if (!user.isVerified && payload.email_verified) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true },
      });
    }

    if (!user.avatar && payload.picture) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { avatar: payload.picture },
      });
    }

    if (!user.fullName && payload.name) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { fullName: payload.name },
      });
    }

    const tokens = await this.issueTokens(user.id, user.email);

    return {
      user: this.buildUserResponse(user),
      ...tokens,
    };
  }

  private async createTransporter() {
    // Support both MAIL_PASSWORD or MAIL_PASS and fallback MAIL_FROM to MAIL_USER
    const host = this.configService.get<string>("MAIL_HOST") || "smtp.gmail.com";
    const port = Number(this.configService.get<string>("MAIL_PORT") ?? 587);
    const user = this.configService.get<string>("MAIL_USER");
    const pass = this.configService.get<string>("MAIL_PASSWORD") || this.configService.get<string>("MAIL_PASS");
    const from = this.configService.get<string>("MAIL_FROM") || user;

    if (!host || !user || !pass || !from) {
      throw new InternalServerErrorException("mail.config_missing");
    }

    return {
      transporter: nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user,
          pass,
        },
      }),
      from,
    };
  }

  private async sendOtpEmail({
    email,
    otp,
    subject,
    message,
  }: {
    email: string;
    otp: string;
    subject: string;
    message: string;
  }) {
    const { transporter, from } = await this.createTransporter();

    await transporter.sendMail({
      from,
      to: email,
      subject,
      text: `${message}\n\nOTP: ${otp}\nExpires in 5 minutes.`,
      html: `<p>${message}</p><p><strong>OTP: ${otp}</strong></p><p>Expires in 5 minutes.</p>`,
    });
  }

  private async readJson<T>(key: string): Promise<T | null> {
    const rawValue = await this.redisservice.get(key);
    if (!rawValue) {
      return null;
    }

    return JSON.parse(rawValue) as T;
  }

  private async saveJson(key: string, value: unknown, ttlSeconds: number) {
    await this.redisservice.set(key, JSON.stringify(value), ttlSeconds);
  }

  private async enforceRateLimit(
    key: string,
    limit: number,
    ttlSeconds: number,
  ) {
    const currentValue = await this.redisservice.get(key);

    if (!currentValue) {
      await this.redisservice.set(key, "1", ttlSeconds);
      return;
    }

    const currentCount = Number(currentValue);
    if (Number.isNaN(currentCount) || currentCount >= limit) {
      throw new HttpException("auth.too_many_requests", HttpStatus.TOO_MANY_REQUESTS);
    }

    await this.redisservice.set(key, String(currentCount + 1), ttlSeconds);
  }

  private buildUserResponse(user: any) {
    return plainToInstance(UserReponse, user, {
      excludeExtraneousValues: true,
    });
  }

  private async issueTokens(userId: string, email: string): Promise<AuthTokens> {
    const accessToken = this.signAccessToken(userId, email);
    const refreshToken = this.signRefreshToken(userId, email);

    await this.redisservice.set(
      this.getRefreshTokenKey(userId),
      this.hashRefreshToken(refreshToken),
      7 * 24 * 60 * 60,
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async register(data: registerDTO) {
    const email = this.normalizeEmail(data.email);
    const existingUser = await this.userService.findByEmail(email);

    if (existingUser) {
      throw new ConflictException("auth.email_exists");
    }

    const pendingRegistration = await this.readJson<PendingRegistrationPayload>(
      this.getPendingRegistrationKey(email),
    );

    if (pendingRegistration) {
      throw new ConflictException("auth.pending_registration_exists");
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const otp = this.generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);

    await this.saveJson(
      this.getPendingRegistrationKey(email),
      {
        email,
        fullName: data.fullName?.trim(),
        passwordHash,
        otpHash,
        attempts: 0,
      } satisfies PendingRegistrationPayload,
      5 * 60,
    );

    await this.enforceRateLimit(
      this.getRegistrationResendKey(email),
      5,
      60 * 60,
    );

    await this.sendOtpEmail({
      email,
      otp,
      subject: "Your GoTogether verification code",
      message: "Use this code to verify your registration",
    });

    return {
      message: "auth.register_otp_sent",
      email,
      expiresInSeconds: 300,
    };
  }

  async verifyRegistrationOtp(data: VerifyRegistrationOtpDto) {
    const email = this.normalizeEmail(data.email);
    const pendingRegistration = await this.readJson<PendingRegistrationPayload>(
      this.getPendingRegistrationKey(email),
    );

    if (!pendingRegistration) {
      throw new BadRequestException("auth.otp_expired");
    }

    const isOtpValid = await bcrypt.compare(
      data.otp,
      pendingRegistration.otpHash,
    );

    if (!isOtpValid) {
      pendingRegistration.attempts += 1;

      if (pendingRegistration.attempts >= 5) {
        await this.redisservice.del(this.getPendingRegistrationKey(email));
        throw new BadRequestException("auth.otp_invalid_too_many_times");
      }

      await this.saveJson(
        this.getPendingRegistrationKey(email),
        pendingRegistration,
        5 * 60,
      );

      throw new BadRequestException("auth.otp_incorrect");
    }

    let userRole = await this.prisma.role.findUnique({
      where: { name: "USER" },
    });

    if (!userRole) {
      // Create default USER role if it doesn't exist to avoid internal errors
      userRole = await this.prisma.role.create({
        data: {
          name: 'USER',
          description: 'Default user role',
        },
      });
    }

    const user = await this.prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email,
          fullName: pendingRegistration.fullName,
          password: pendingRegistration.passwordHash,
          isVerified: true,
        },
      });

      await tx.userRole.create({
        data: {
          userId: createdUser.id,
          roleId: userRole.id,
        },
      });

      return createdUser;
    });

    await this.redisservice.del(this.getPendingRegistrationKey(email));
    await this.redisservice.del(this.getRegistrationResendKey(email));

    const tokens = await this.issueTokens(user.id, user.email);

    return {
      message: "auth.register_success",
      user: this.buildUserResponse(user),
      ...tokens,
    };
  }

  async resendRegistrationOtp(data: ResendOtpDto) {
    const email = this.normalizeEmail(data.email);
    const pendingRegistration = await this.readJson<PendingRegistrationPayload>(
      this.getPendingRegistrationKey(email),
    );

    if (!pendingRegistration) {
      throw new BadRequestException("auth.otp_expired");
    }

    await this.enforceRateLimit(
      this.getRegistrationResendKey(email),
      5,
      60 * 60,
    );

    const otp = this.generateOtp();
    pendingRegistration.otpHash = await bcrypt.hash(otp, 10);
    pendingRegistration.attempts = 0;

    await this.saveJson(
      this.getPendingRegistrationKey(email),
      pendingRegistration,
      5 * 60,
    );

    await this.sendOtpEmail({
      email,
      otp,
      subject: "Your GoTogether verification code",
      message: "Your registration OTP has been resent",
    });

    return { message: "auth.register_otp_resent" };
  }

  async login(data: loginDTO) {
    const email = this.normalizeEmail(data.email);
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException("auth.user_not_found");
    }

    if (!user.isVerified) {
      throw new UnauthorizedException("auth.email_not_verified");
    }

    if (!user.password) {
      throw new UnauthorizedException("auth.password_not_set");
    }

    const match = await bcrypt.compare(data.password, user.password);

    if (!match) {
      throw new UnauthorizedException("auth.password_incorrect");
    }

    const tokens = await this.issueTokens(user.id, user.email);

    return {
      user: this.buildUserResponse(user),
      ...tokens,
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
    const refreshSecret =
      this.configService.get<string>("JWT_REFRESH_SECRET") ||
      this.configService.get<string>("JWT_SECRET");

    return this.jwtService.sign(
      {
        sub: userID,
        email,
      },
      {
        expiresIn: "7d",
        secret: refreshSecret,
      },
    );
  }

  async logout(userId: string, deviceId?: string) {
    await this.redisservice.del(this.getRefreshTokenKey(userId));

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

    await this.redisservice.del(this.getRefreshTokenKey(userId));

    return { message: "auth.password_change_success" };
  }

  async refreshToken(data: RefreshTokenDto) {
    try {
      const refreshSecret =
        this.configService.get<string>("JWT_REFRESH_SECRET") ||
        this.configService.get<string>("JWT_SECRET");
      const payload = this.jwtService.verify(data.refreshToken, {
        secret: refreshSecret,
      }) as { sub: string; email: string };

      const storedTokenHash = await this.redisservice.get(
        this.getRefreshTokenKey(payload.sub),
      );

      if (!storedTokenHash) {
        throw new UnauthorizedException("auth.refresh_expried");
      }

      if (storedTokenHash !== this.hashRefreshToken(data.refreshToken)) {
        throw new UnauthorizedException("auth.refresh_expried");
      }

      const tokens = await this.issueTokens(payload.sub, payload.email);

      return {
        status: true,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException("auth.refresh_expried");
    }
  }

  getGoogleAuthUrl() {
    const client = this.getGoogleClientOrFail();

    return client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: ["openid", "email", "profile"],
    });
  }

  async handleGoogleCallback(code: string) {
    const client = this.getGoogleClientOrFail();
    const { tokens: googleTokens } = await client.getToken(code);
    const idToken = googleTokens.id_token;

    if (!idToken) {
      throw new UnauthorizedException("auth.google_invalid_token");
    }
    const authResult = await this.processGoogleIdToken(idToken);

    const mobileScheme =
      this.configService.get<string>("MOBILE_APP_SCHEME") || "gotogetherapp";
    const deepLinkUrl = new URL(`${mobileScheme}://auth/google/callback`);
    deepLinkUrl.searchParams.set("accessToken", authResult.accessToken);
    deepLinkUrl.searchParams.set("refreshToken", authResult.refreshToken);
    deepLinkUrl.searchParams.set(
      "user",
      encodeURIComponent(JSON.stringify(authResult.user)),
    );

    return {
      url: deepLinkUrl.toString(),
      statusCode: 302,
    };
  }

  async handleGoogleMobileLogin(idToken: string) {
    return this.processGoogleIdToken(idToken);
  }

  async requestForgotPassword(data: ForgotPasswordRequestDto) {
    const email = this.normalizeEmail(data.email);
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new BadRequestException("auth.email_not_found");
    }

    if (!user.password) {
      throw new BadRequestException("auth.password_not_set");
    }

    await this.enforceRateLimit(
      this.getPasswordResetResendKey(email),
      5,
      60 * 60,
    );

    const otp = this.generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);

    await this.saveJson(
      this.getPasswordResetKey(email),
      {
        email,
        otpHash,
        attempts: 0,
      } satisfies PasswordResetPayload,
      5 * 60,
    );

    await this.sendOtpEmail({
      email,
      otp,
      subject: "Reset your GoTogether password",
      message: "Use this OTP to reset your password",
    });

    return {
      message: "auth.password_reset_otp_sent",
      expiresInSeconds: 300,
    };
  }

  async resetPasswordWithOtp(data: ResetPasswordOtpDto) {
    const email = this.normalizeEmail(data.email);
    const payload = await this.readJson<PasswordResetPayload>(
      this.getPasswordResetKey(email),
    );

    if (!payload) {
      throw new BadRequestException("auth.otp_expired");
    }

    const isOtpValid = await bcrypt.compare(data.otp, payload.otpHash);

    if (!isOtpValid) {
      payload.attempts += 1;

      if (payload.attempts >= 5) {
        await this.redisservice.del(this.getPasswordResetKey(email));
        throw new BadRequestException("auth.otp_invalid_too_many_times");
      }

      await this.saveJson(this.getPasswordResetKey(email), payload, 5 * 60);
      throw new BadRequestException("auth.otp_incorrect");
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new BadRequestException("auth.email_not_found");
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    await this.redisservice.del(this.getPasswordResetKey(email));
    await this.redisservice.del(this.getRefreshTokenKey(user.id));

    return { message: "auth.password_reset_success" };
  }
}