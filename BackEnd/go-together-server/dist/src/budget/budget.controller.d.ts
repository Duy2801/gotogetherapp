import { BudgetService } from "./budget.service";
import { CreateBudgetDto } from "./dto/create-budget.dto";
import { UpdateBudgetDto } from "./dto/update-budget.dto";
export declare class BudgetController {
    private budgetService;
    constructor(budgetService: BudgetService);
    createBudget(req: any, dto: CreateBudgetDto): Promise<any>;
    getBudgetByMonth(req: any, month?: string, year?: string): Promise<any>;
    updateBudget(req: any, budgetId: string, dto: UpdateBudgetDto): Promise<any>;
}
