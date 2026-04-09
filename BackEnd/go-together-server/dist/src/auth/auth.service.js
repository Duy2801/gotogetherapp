"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("../user/user.service");
const bcrypt = __importStar(require("bcrypt"));
const prisma_service_1 = require("../prisma/prisma.service");
const redis_service_1 = require("../redis/redis.service");
const bull_1 = require("@nestjs/bull");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const class_transformer_1 = require("class-transformer");
const user_reponse_1 = require("../user/dto/user.reponse");
const google_auth_library_1 = require("google-auth-library");
let AuthService = class AuthService {
    userService;
    prisma;
    redisservice;
    jwtService;
    configService;
    mailQueue;
    googleClient;
    constructor(userService, prisma, redisservice, jwtService, configService, mailQueue) {
        this.userService = userService;
        this.prisma = prisma;
        this.redisservice = redisservice;
        this.jwtService = jwtService;
        this.configService = configService;
        this.mailQueue = mailQueue;
        this.googleClient = new google_auth_library_1.OAuth2Client(this.configService.get("GOOGLE_CLIENT_ID"));
    }
    generateOtp() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    async register(data) {
        const existingUser = await this.userService.findByEmail(data.email);
        if (existingUser) {
            throw new common_1.ConflictException("auth.email_exists");
        }
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const userRole = await this.prisma.role.findUnique({
            where: { name: "USER" },
        });
        if (!userRole) {
            throw new common_1.BadRequestException("system.internal_error");
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
    async login(data) {
        const user = await this.userService.findByEmail(data.email);
        if (!user)
            throw new common_1.UnauthorizedException("user not exists");
        if (user.password === null)
            throw new common_1.UnauthorizedException("password is not null");
        const match = await bcrypt.compare(data.password, user.password);
        if (!match)
            throw new common_1.UnauthorizedException("auth.password_incorrect");
        const accessToken = this.signAccessToken(user.id, user.email);
        const refressToken = this.signAccessToken(user.id, user.email);
        await this.redisservice.set(`refresh_token:${user.id}`, refressToken, 7 * 24 * 60 * 60);
        const userReponse = (0, class_transformer_1.plainToInstance)(user_reponse_1.UserReponse, user, {
            excludeExtraneousValues: true,
        });
        return {
            user: userReponse,
            accessToken: accessToken,
        };
    }
    signAccessToken(userID, email) {
        return this.jwtService.sign({
            sub: userID,
            email,
        }, {
            expiresIn: "15m",
            secret: this.configService.get("JWT_SECRET"),
        });
    }
    signRefreshToken(userID, email) {
        return this.jwtService.sign({
            sub: userID,
            email,
        }, {
            expiresIn: "7d",
            secret: this.configService.get("JWT_SECRET"),
        });
    }
    async logout(userId, deviceId) {
        await this.redisservice.del(`refresh_token:${userId}`);
        if (deviceId) {
            await this.prisma.device.deleteMany({
                where: { userId, deviceId },
            });
        }
        else {
            await this.prisma.device.deleteMany({
                where: { userId },
            });
        }
        return {
            message: "auth.logout_success",
        };
    }
    async changePassword(userId, data) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, password: true },
        });
        if (!user) {
            throw new common_1.UnauthorizedException("user not exists");
        }
        if (!user.password) {
            throw new common_1.BadRequestException("auth.password_not_set");
        }
        const match = await bcrypt.compare(data.oldPassword, user.password);
        if (!match) {
            throw new common_1.BadRequestException("auth.password_incorrect");
        }
        const hashedPassword = await bcrypt.hash(data.newPassword, 10);
        await this.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
        return { message: "auth.password_change_success" };
    }
    async refreshToken(userId) {
        try {
            const key = `refresh_token:${userId}`;
            const storedToken = await this.redisservice.get(key);
            if (!storedToken) {
                throw new common_1.UnauthorizedException("auth.refresh_expried");
            }
            const payload = this.jwtService.verify(storedToken, {
                secret: this.configService.get("JWT_SECRET"),
            });
            const newAccessToken = this.signAccessToken(payload.sub, payload.email);
            return {
                status: true,
                acssToken: newAccessToken,
            };
        }
        catch (error) {
            throw new common_1.UnauthorizedException("auth.refresh_expried");
        }
    }
    async verifyGoogleToken(idToken) {
        const ticket = await this.googleClient.verifyIdToken({
            idToken,
            audience: this.configService.get("GOOGLE_CLIENT_ID"),
        });
        return ticket.getPayload();
    }
    async loginWithGoogle(idToken) {
        const payload = await this.verifyGoogleToken(idToken);
        if (!payload?.email) {
            throw new common_1.UnauthorizedException("auth.google_invalid_token");
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
        const userReponse = (0, class_transformer_1.plainToInstance)(user_reponse_1.UserReponse, user, {
            excludeExtraneousValues: true,
        });
        const accessToken = this.signAccessToken(user.id, user.email);
        const refreshToken = this.signRefreshToken(user.id, user.email);
        await this.redisservice.set(`refresh_token:${user.id}`, refreshToken, 7 * 24 * 60 * 60);
        return {
            user: userReponse,
            accessToken: accessToken,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(5, (0, bull_1.InjectQueue)("mail-queue")),
    __metadata("design:paramtypes", [user_service_1.UserService,
        prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        jwt_1.JwtService,
        config_1.ConfigService, Object])
], AuthService);
//# sourceMappingURL=auth.service.js.map