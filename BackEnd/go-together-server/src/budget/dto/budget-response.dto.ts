export class BudgetResponseDto {
  id!: string;
  userId!: string;
  amount!: number;
  spent!: number;
  month!: number;
  year!: number;
  warningAt!: number;
  percentage!: number;
  remaining!: number;
  isOverBudget!: boolean;
  isWarning!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}

export class BudgetSummaryDto {
  totalBudget!: number;
  totalSpent!: number;
  totalRemaining!: number;
  percentage!: number;
  budgetCount!: number;
  overBudgetCount!: number;
  warningCount!: number;
  month!: number;
  year!: number;
}
