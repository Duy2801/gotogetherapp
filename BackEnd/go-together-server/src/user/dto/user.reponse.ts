import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { UserStatus } from "prisma/generated/client";
export class UserReponse {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  email: string;

  @ApiProperty()
  @Expose()
  fullName: string;

  @ApiProperty({ required: false, type: String })
  @Expose()
  dateOfBirth?: Date;

  @ApiProperty({ required: false, description: "0: Nam, 1: Nữ" })
  @Expose()
  gender?: number;

  @ApiProperty({ required: false, type: String })
  @Expose()
  avatar?: string;

  
  @ApiProperty({ enum: UserStatus })
  @Expose()
  status: UserStatus;

  @ApiProperty()
  @Expose()
  isVerified: boolean;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;
}
