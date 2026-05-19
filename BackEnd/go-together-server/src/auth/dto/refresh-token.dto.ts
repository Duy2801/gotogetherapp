import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";

export class RefreshTokenDto {
  @ApiProperty({ example: "eyJhbGciOiJIUzI1NiIs..." })
  @IsString()
  @MinLength(20)
  refreshToken!: string;
}