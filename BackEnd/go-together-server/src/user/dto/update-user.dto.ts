import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class UpdateUserDto {
  @ApiProperty({ required: false, example: "Nguyen Van A" })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({ required: false, example: "2000-01-01" })
  @IsOptional()
  @IsString()
  dateOfBirth?: string;

  @ApiProperty({ required: false, example: 0, description: "0: Nam, 1: Nữ" })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1)
  gender?: number;

  @ApiProperty({ required: false, example: "https://.../avatar.png" })
  @IsOptional()
  @IsString()
  avatar?: string;
}
