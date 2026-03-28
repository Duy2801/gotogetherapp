import { PrismaService } from "src/prisma/prisma.service";
import { NotificationGateway } from "src/notification/notification.gateway";
export declare class ExpenseSplitService {
    private prisma;
    private notificationGateway;
    constructor(prisma: PrismaService, notificationGateway: NotificationGateway);
    markAsPaid(userId: string, splitId: string): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        amount: import("@prisma/client-runtime-utils").Decimal;
        expenseId: string;
        percentage: import("@prisma/client-runtime-utils").Decimal | null;
        splitType: import("../../prisma/generated/enums").SplitType;
        isPaid: boolean;
        paidAt: Date | null;
        confirmed: boolean;
        confirmedAt: Date | null;
    }>;
    confirmReceived(userId: string, splitId: string): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
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
