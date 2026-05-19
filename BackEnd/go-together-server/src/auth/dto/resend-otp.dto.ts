import { ApiProperty } from "@nestjs/swagger";
import { IsEmail } from "class-validator";

export class ResendOtpDto {
  @ApiProperty({ example: "nguyenvana@gmail.com" })
  @IsEmail()
  email!: string;
}