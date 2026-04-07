import { PrismaService } from "src/prisma/prisma.service";
import { NotificationGateway } from "src/notification/notification.gateway";
import { NotificationService } from "src/notification/notification.service";
export declare class ExpenseSplitService {
    private prisma;
    private notificationGateway;
    private notificationService;
    constructor(prisma: PrismaService, notificationGateway: NotificationGateway, notificationService: NotificationService);
    markAsPaid(userId: string, splitId: string): Promise<{
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
    confirmReceived(userId: string, splitId: string): Promise<{
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
