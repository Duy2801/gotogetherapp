export declare class BudgetResponseDto {
    id: string;
    userId: string;
    categoryId?: string;
    categoryName?: string;
    categoryIcon?: string;
    categoryColor?: string;
    amount: number;
    spent: number;
    month: number;
    year: number;
    warningAt: number;
    percentage: number;
    remaining: number;
    isOverBudget: boolean;
    isWarning: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare class BudgetSummaryDto {
    totalBudget: number;
    totalSpent: number;
    totalRemaining: number;
    percentage: number;
    budgetCount: number;
    overBudgetCount: number;
    warningCount: number;
    month: number;
    year: number;
}
