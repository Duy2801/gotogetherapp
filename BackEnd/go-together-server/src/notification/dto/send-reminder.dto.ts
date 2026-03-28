import { IsString, IsOptional } from 'class-validator';

export class SendReminderDto {
  @IsString()
  message?: string;
}
