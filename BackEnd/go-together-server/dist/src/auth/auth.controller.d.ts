import { loginDTO } from "./dto/login.dto";
import { registerDTO } from "./dto/register.dto";
import { AuthService } from "./auth.service";
import { GoogleLoginDto } from "./dto/google-login.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(dto: registerDTO): Promise<{
        message: string;
    }>;
    login(dto: loginDTO): Promise<{
        user: import("../user/dto/user.reponse").UserReponse;
        accessToken: string;
    }>;
    logout(req: any, deviceId?: string): Promise<{
        message: string;
    }>;
    changePassword(req: any, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    loginWithGoogle(dto: GoogleLoginDto): any;
}
