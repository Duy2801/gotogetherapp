import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, MinLength } from "class-validator";
export class loginDTO {
  @ApiProperty({ example: "nguyenvana@gmail.com" })
  @IsEmail({}, { message: "Validator.email" })
  email!: string;

  @ApiProperty({ example: "123456" })
  @MinLength(6)
  password!: string;
}
