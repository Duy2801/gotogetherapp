import { Module } from "@nestjs/common";
import { ExpenseService } from "./expense.service";
import { ExpenseController } from "./expense.controller";
import { TripMemberModule } from "src/trip-member/tripmember.module";
import { NotificationModule } from "src/notification/notification.module";

@Module({
  imports: [TripMemberModule, NotificationModule],
  controllers: [ExpenseController],
  providers: [ExpenseService],
})
export class ExpenseModule {}
