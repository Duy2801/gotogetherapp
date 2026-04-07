import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { NotificationGateway } from "src/notification/notification.gateway";
import { NotificationService } from "src/notification/notification.service";

@Injectable()
export class ExpenseSplitService {
  constructor(
    private prisma: PrismaService,
    private notificationGateway: NotificationGateway,
    private notificationService: NotificationService,
  ) {}

  async markAsPaid(userId: string, splitId: string) {
    const split = await this.prisma.expenseSplit.findUnique({
      where: { id: splitId },
      include: {
        expense: {
          include: {
            paidBy: { select: { fullName: true, id: true } },
          },
        },
        user: { select: { fullName: true, id: true } },
      },
    });
    if (!split) {
      throw new NotFoundException("Khoản chia tiền không tồn tại");
    }
    if (split.userId !== userId) {
      console.log(split.userId, userId);
      throw new ForbiddenException("Bạn không thể thanh toán khoản này");
    }
    if (split.isPaid) {
      throw new BadRequestException("Khoản này đã được đánh dấu trả rồi");
    }

    const updated = await this.prisma.expenseSplit.update({
      where: { id: splitId },
      data: {
        isPaid: true,
        paidAt: new Date(),
      },
    });

    const message = `${split.user.fullName} đã đánh dấu trả tiền cho ${split.expense.description}`;

    // Create database notification for paidBy user (person who lent the money)
    await this.notificationService.createPaymentMarkedNotification(
      split.expense.paidById,
      split.userId,
      splitId,
      split.expense.id,
      split.expense.tripId,
      message,
      {
        amount: split.amount,
        paidBy: split.user.fullName,
        paidTo: split.expense.paidBy.fullName,
      },
    );

    // Emit payment marked notification via socket
    this.notificationGateway.emitPaymentMarked(split.expense.tripId, {
      type: "PAYMENT_MARKED",
      message,
      amount: split.amount,
      paidBy: split.user.fullName,
      paidTo: split.expense.paidBy.fullName,
      splitId: split.id,
      timestamp: new Date().toISOString(),
    });

    return updated;
  }

  async confirmReceived(userId: string, splitId: string) {
    const split = await this.prisma.expenseSplit.findUnique({
      where: { id: splitId },
      include: {
        expense: {
          include: {
            paidBy: { select: { fullName: true } },
          },
        },
        user: { select: { fullName: true, id: true } },
      },
    });
    if (!split) {
      throw new NotFoundException("Khoản chia tiền không tồn tại");
    }
    if (!split.isPaid) {
      throw new BadRequestException("Người này chưa đánh dấu đã trả");
    }
    if (split.confirmed) {
      throw new BadRequestException("Khoản này đã được xác nhận rồi");
    }
    // Chỉ người được trả (người ứng tiền ban đầu) mới có thể xác nhận nhận tiền
    if (String(split.expense.paidById) !== String(userId)) {
      throw new ForbiddenException("Bạn không có quyền xác nhận khoản này");
    }

    const updated = await this.prisma.expenseSplit.update({
      where: { id: splitId },
      data: {
        confirmed: true,
        confirmedAt: new Date(),
      },
    });

    const message = `${split.expense.paidBy.fullName} đã xác nhận nhận tiền từ ${split.user.fullName}`;

    // Create database notification for the user who paid (splitId owner)
    await this.notificationService.createPaymentConfirmedNotification(
      split.userId,
      split.expense.paidById,
      splitId,
      split.expense.id,
      split.expense.tripId,
      message,
      {
        amount: split.amount,
        paidBy: split.user.fullName,
        paidTo: split.expense.paidBy.fullName,
      },
    );

    // Emit payment confirmed notification via socket
    this.notificationGateway.emitPaymentConfirmed(split.expense.tripId, {
      type: "PAYMENT_CONFIRMED",
      message,
      amount: split.amount,
      paidBy: split.user.fullName,
      paidTo: split.expense.paidBy.fullName,
      splitId: split.id,
      timestamp: new Date().toISOString(),
    });

    return updated;
  }
}
