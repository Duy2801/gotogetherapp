import { loginDTO } from "./dto/login.dto";
import { registerDTO } from "./dto/register.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { AuthService } from "./auth.service";
import {
  Post,
  Put,
  Get,
  Controller,
  Body,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { GoogleLoginDto } from "./dto/google-login.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("register")
  register(@Body() dto: registerDTO) {
    return this.authService.register(dto);
  }
  @Post("login")
  login(@Body() dto: loginDTO) {
    return this.authService.login(dto);
  }
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post("logout")
  logout(@Req() req: any, deviceId?: string) {
    return this.authService.logout(req.user.sub, deviceId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post("change-password")
  changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.userId, dto);
  }
  @Post("google")
  loginWithGoogle(@Body() dto: GoogleLoginDto) {
    return this.loginWithGoogle(dto);
  }
}
