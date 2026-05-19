import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, Length } from "class-validator";

export class VerifyRegistrationOtpDto {
  @ApiProperty({ example: "nguyenvana@gmail.com" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "123456" })
  @IsString()
  @Length(6, 6)
  otp!: string;
}