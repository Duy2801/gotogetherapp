import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateCommentDTO {
  @ApiProperty({ example: "Nice memory!" })
  @IsString()
  content?: string;
}
