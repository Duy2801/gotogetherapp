import { ExpenseService } from "./expense.service";
import { CreateExpense } from "./dto/create-Expense.dto";
export declare class ExpenseController {
    private expenseService;
    constructor(expenseService: ExpenseService);
    getExpenseCategories(req: Request, tripId: string): Promise<{
        name: string;
        id: string;
        icon: string | null;
        color: string | null;
    }[]>;
    getTripExpenses(req: Request, tripId: string, categoryId?: string, fromDate?: string, toDate?: string, page?: number, limit?: number): Promise<{
        expenses: {
            id: any;
            tripId: any;
            amount: number;
            currency: any;
            categoryId: any;
            description: any;
            paidById: any;
            type: any;
            date: any;
            receipt: any;
            isConfirmed: any;
            createdAt: any;
            category: any;
            paidBy: any;
            splits: any;
        }[];
        total: number;
    }>;
    createExpense(req: Request, tripId: string, dto: CreateExpense): Promise<{
        id: any;
        tripId: any;
        amount: number;
        currency: any;
        categoryId: any;
        description: any;
        paidById: any;
        type: any;
        date: any;
        receipt: any;
        isConfirmed: any;
        createdAt: any;
        category: any;
        paidBy: any;
        splits: any;
    }>;
    amountPaid(req: Request): Promise<number>;
    getTotalDebt(req: Request): Promise<number>;
    getTotalReceived(req: Request): Promise<number>;
}
