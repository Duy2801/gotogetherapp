import { IsNotEmpty, IsNumber, IsOptional, Min } from "class-validator";

export class CreateBudgetDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number | undefined;

  @IsOptional()
  @IsNumber()
  @Min(1)
  month?: number;

  @IsOptional()
  @IsNumber()
  year?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  warningAt?: number;
}
