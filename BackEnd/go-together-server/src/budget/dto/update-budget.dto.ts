import { IsNumber, IsOptional, Min } from "class-validator";

export class UpdateBudgetDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  warningAt?: number;
}
