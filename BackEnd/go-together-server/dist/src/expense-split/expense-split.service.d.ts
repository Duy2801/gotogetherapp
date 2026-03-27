import { PrismaService } from "src/prisma/prisma.service";
export declare class ExpenseSplitService {
    private prisma;
    constructor(prisma: PrismaService);
    markAsPaid(userId: string, splitId: string): Promise<{
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
    confirmReceived(userId: string, splitId: string): Promise<{
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
