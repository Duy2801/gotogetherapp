import { loginDTO } from "./dto/login.dto";
import { registerDTO } from "./dto/register.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { AuthService } from "./auth.service";
import {
  Get,
  Controller,
  Body,
  Post,
  Query,
  Req,
  UseGuards,
  Redirect,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { ForgotPasswordRequestDto } from "./dto/forgot-password-request.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { ResendOtpDto } from "./dto/resend-otp.dto";
import { ResetPasswordOtpDto } from "./dto/reset-password-otp.dto";
import { VerifyRegistrationOtpDto } from "./dto/verify-registration-otp.dto";
import { GoogleLoginDto } from "./dto/google-login.dto";
@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("register")
  register(@Body() dto: registerDTO) {
    return this.authService.register(dto);
  }

  @Post("register/verify-otp")
  verifyRegisterOtp(@Body() dto: VerifyRegistrationOtpDto) {
    return this.authService.verifyRegistrationOtp(dto);
  }

  @Post("register/resend-otp")
  resendRegisterOtp(@Body() dto: ResendOtpDto) {
    return this.authService.resendRegistrationOtp(dto);
  }

  @Post("login")
  login(@Body() dto: loginDTO) {
    return this.authService.login(dto);
  }

  @Post("refresh-token")
  refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post("logout")
  logout(@Req() req: any, @Body("deviceId") deviceId?: string) {
    return this.authService.logout(req.user.sub, deviceId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post("change-password")
  changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.sub, dto);
  }

  @Post("forgot-password")
  forgotPassword(@Body() dto: ForgotPasswordRequestDto) {
    return this.authService.requestForgotPassword(dto);
  }

  @Post("forgot-password/verify-otp")
  resetPassword(@Body() dto: ResetPasswordOtpDto) {
    return this.authService.resetPasswordWithOtp(dto);
  }

  @Get("google")
  @Redirect()
  googleLogin() {
    return {
      url: this.authService.getGoogleAuthUrl(),
      statusCode: 302,
    };
  }

  @Get("google/callback")
  @ApiOperation({ summary: "Google OAuth2 callback" })
  googleCallback(@Query("code") code: string) {
    return this.authService.handleGoogleCallback(code);
  }

  @Post("google/mobile")
  @ApiOperation({ summary: "Google login for mobile apps" })
  googleMobileLogin(@Body() dto: GoogleLoginDto) {
    return this.authService.handleGoogleMobileLogin(dto.idToken);
  }
}
