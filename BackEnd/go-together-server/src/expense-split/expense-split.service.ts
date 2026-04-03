import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { NotificationGateway } from "src/notification/notification.gateway";

@Injectable()
export class ExpenseSplitService {
  constructor(
    private prisma: PrismaService,
    private notificationGateway: NotificationGateway,
  ) {}

  async markAsPaid(userId: string, splitId: string) {
    const split = await this.prisma.expenseSplit.findUnique({
      where: { id: splitId },
      include: {
        expense: {
          include: {
            paidBy: { select: { fullName: true } },
          },
        },
        user: { select: { fullName: true } },
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

    // Emit payment marked notification
    this.notificationGateway.emitPaymentMarked(split.expense.tripId, {
      type: "PAYMENT_MARKED",
      message: `${split.user.fullName} đã đánh dấu trả tiền cho ${split.expense.description}`,
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
        user: { select: { fullName: true } },
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

    // Emit payment confirmed notification
    this.notificationGateway.emitPaymentConfirmed(split.expense.tripId, {
      type: "PAYMENT_CONFIRMED",
      message: `${split.expense.paidBy.fullName} đã xác nhận nhận tiền từ ${split.user.fullName}`,
      amount: split.amount,
      paidBy: split.user.fullName,
      paidTo: split.expense.paidBy.fullName,
      splitId: split.id,
      timestamp: new Date().toISOString(),
    });

    return updated;
  }
}
