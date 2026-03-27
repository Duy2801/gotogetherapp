import { Controller, Param, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { ExpenseSplitService } from "./expense-split.service";

@Controller("expense-split")
@ApiTags("Expense-split")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ExpenseSplitController {
  constructor(private expenseSplitService: ExpenseSplitService) {}

  @Post(":id/pay")
  markAsPaid(@Param("id") splitId: string, @Req() req: any) {
    return this.expenseSplitService.markAsPaid(req.user.userId, splitId);
  }
  @Post(":id/confirm")
  confirmReceived(@Param("id") splitId: string, @Req() req: any) {
    return this.expenseSplitService.confirmReceived(req.user.userId, splitId);
  }
}
