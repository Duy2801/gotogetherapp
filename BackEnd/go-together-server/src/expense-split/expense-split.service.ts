import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class ExpenseSplitService {
  constructor(private prisma: PrismaService) {}

  async markAsPaid(userId: string, splitId: string) {
    const split = await this.prisma.expenseSplit.findUnique({
      where: { id: splitId },
    });
    if (!split) {
      throw new NotFoundException("Khoản chia tiền không tồn tại");
    }
    if (split.userId !== userId) {
      console.log(split.userId , userId)
      throw new ForbiddenException("Bạn không thể thanh toán khoản này");
    }
    if (split.isPaid) {
      throw new BadRequestException("Khoản này đã được đánh dấu trả rồi");
    }
    return this.prisma.expenseSplit.update({
      where: { id: splitId },
      data: {
        isPaid: true,
        paidAt: new Date(),
      },
    });
  }
  async confirmReceived(userId: string, splitId: string) {
    const split = await this.prisma.expenseSplit.findUnique({
      where: { id: splitId },
      include: { expense: true },
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
    return this.prisma.expenseSplit.update({
      where: { id: splitId },
      data: {
        confirmed: true,
        confirmedAt: new Date(),
      },
    });
  }
}
