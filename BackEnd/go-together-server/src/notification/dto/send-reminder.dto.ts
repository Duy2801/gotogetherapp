import { IsString, IsOptional, IsUUID } from "class-validator";

export class SendReminderDto {
  @IsString()
  @IsOptional()
  message?: string;

  @IsUUID()
  @IsOptional()
  splitId?: string;
}
