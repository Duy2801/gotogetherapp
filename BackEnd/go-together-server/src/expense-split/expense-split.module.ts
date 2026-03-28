import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { NotificationModule } from "src/notification/notification.module";
import { ExpenseSplitController } from "./expense-split.controller";
import { ExpenseSplitService } from "./expense-split.service";

@Module({
  imports: [PrismaModule, NotificationModule],
  controllers: [ExpenseSplitController],
  providers: [ExpenseSplitService],
})
export class ExpenseSplitModule {}
