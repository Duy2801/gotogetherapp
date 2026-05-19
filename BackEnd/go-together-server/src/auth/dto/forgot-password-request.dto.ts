import { ApiProperty } from "@nestjs/swagger";
import { IsEmail } from "class-validator";

export class ForgotPasswordRequestDto {
  @ApiProperty({ example: "nguyenvana@gmail.com" })
  @IsEmail()
  email!: string;
}