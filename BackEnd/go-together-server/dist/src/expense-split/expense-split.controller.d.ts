import { ExpenseSplitService } from "./expense-split.service";
export declare class ExpenseSplitController {
    private expenseSplitService;
    constructor(expenseSplitService: ExpenseSplitService);
    markAsPaid(splitId: string, req: any): Promise<{
        id: string;
        expenseId: string;
        userId: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        percentage: import("@prisma/client-runtime-utils").Decimal | null;
        splitType: import("../../prisma/generated/enums").SplitType;
        isPaid: boolean;
        paidAt: Date | null;
        confirmed: boolean;
        confirmedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    confirmReceived(splitId: string, req: any): Promise<{
        id: string;
        expenseId: string;
        userId: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        percentage: import("@prisma/client-runtime-utils").Decimal | null;
        splitType: import("../../prisma/generated/enums").SplitType;
        isPaid: boolean;
        paidAt: Date | null;
        confirmed: boolean;
        confirmedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
