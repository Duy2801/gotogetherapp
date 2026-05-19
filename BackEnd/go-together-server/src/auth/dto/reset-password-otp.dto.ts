import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, Length, MinLength } from "class-validator";

export class ResetPasswordOtpDto {
  @ApiProperty({ example: "nguyenvana@gmail.com" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "123456" })
  @IsString()
  @Length(6, 6)
  otp!: string;

  @ApiProperty({ example: "newPassword123" })
  @IsString()
  @MinLength(6)
  newPassword!: string;
}