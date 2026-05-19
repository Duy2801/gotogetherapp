import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";

export class registerDTO {
  @ApiProperty({ example: "nguyenvana@gmail.com" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "Nguyen Van A", required: false })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({ example: "123456" })
  @MinLength(6)
  password!: string;
}
