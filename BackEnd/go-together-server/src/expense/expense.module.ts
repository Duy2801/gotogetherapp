import { Module } from "@nestjs/common";
import { ExpenseService } from "./expense.service";
import { AdminExpenseController } from "./admin-expense.controller";
import { ExpenseController } from "./expense.controller";
import { TripMemberModule } from "src/trip-member/tripmember.module";
import { NotificationModule } from "src/notification/notification.module";

@Module({
  imports: [TripMemberModule, NotificationModule],
  controllers: [ExpenseController, AdminExpenseController],
  providers: [ExpenseService],
  exports: [ExpenseService],
})
export class ExpenseModule {}
