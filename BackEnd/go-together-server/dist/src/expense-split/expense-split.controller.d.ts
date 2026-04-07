import { ExpenseSplitService } from "./expense-split.service";
export declare class ExpenseSplitController {
    private expenseSplitService;
    constructor(expenseSplitService: ExpenseSplitService);
    markAsPaid(splitId: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        expenseId: string;
        percentage: import("@prisma/client-runtime-utils").Decimal | null;
        splitType: import("../../prisma/generated/enums").SplitType;
        isPaid: boolean;
        paidAt: Date | null;
        confirmed: boolean;
        confirmedAt: Date | null;
    }>;
    confirmReceived(splitId: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        expenseId: string;
        percentage: import("@prisma/client-runtime-utils").Decimal | null;
        splitType: import("../../prisma/generated/enums").SplitType;
        isPaid: boolean;
        paidAt: Date | null;
        confirmed: boolean;
        confirmedAt: Date | null;
    }>;
}
