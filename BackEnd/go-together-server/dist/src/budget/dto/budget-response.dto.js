"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BudgetSummaryDto = exports.BudgetResponseDto = void 0;
class BudgetResponseDto {
    id;
    userId;
    amount;
    spent;
    month;
    year;
    warningAt;
    percentage;
    remaining;
    isOverBudget;
    isWarning;
    createdAt;
    updatedAt;
}
exports.BudgetResponseDto = BudgetResponseDto;
class BudgetSummaryDto {
    totalBudget;
    totalSpent;
    totalRemaining;
    percentage;
    budgetCount;
    overBudgetCount;
    warningCount;
    month;
    year;
}
exports.BudgetSummaryDto = BudgetSummaryDto;
//# sourceMappingURL=budget-response.dto.js.map