import { ExpenseSplitService } from "./expense-split.service";
export declare class ExpenseSplitController {
    private expenseSplitService;
    constructor(expenseSplitService: ExpenseSplitService);
    markAsPaid(splitId: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        expenseId: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        updatedAt: Date;
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
        userId: string;
        expenseId: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        updatedAt: Date;
        percentage: import("@prisma/client-runtime-utils").Decimal | null;
        splitType: import("../../prisma/generated/enums").SplitType;
        isPaid: boolean;
        paidAt: Date | null;
        confirmed: boolean;
        confirmedAt: Date | null;
    }>;
}
