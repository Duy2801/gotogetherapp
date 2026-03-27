import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { ExpenseSplitController } from "./expense-split.controller";
import { ExpenseSplitService } from "./expense-split.service";

@Module({
  imports: [PrismaModule],
  controllers: [ExpenseSplitController],
  providers: [ExpenseSplitService],
})
export class ExpenseSplitModule {}
