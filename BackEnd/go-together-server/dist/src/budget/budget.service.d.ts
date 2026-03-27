import { PrismaService } from "src/prisma/prisma.service";
import { CreateBudgetDto } from "./dto/create-budget.dto";
import { UpdateBudgetDto } from "./dto/update-budget.dto";
export declare class BudgetService {
    private prisma;
    constructor(prisma: PrismaService);
    createBudget(userId: string, dto: CreateBudgetDto): Promise<any>;
    updateBudget(budgetId: string, userId: string, dto: UpdateBudgetDto): Promise<any>;
    getBudgetByMonth(userId: string, month?: number, year?: number): Promise<any>;
    autoCreateMonthlyBudget(userId: string, month: number, year: number): Promise<void>;
}
