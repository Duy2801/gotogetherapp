import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { UserModule } from "src/user/user.module";
import { RedisModule } from "src/redis/redis.module";
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { JwtStrategy } from "./strategies/jwt.strategy";

@Module({
  imports: [
    UserModule,
    RedisModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET"),
        signOptions: { expiresIn: "7d" },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
