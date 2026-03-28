import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MulterModule } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { PrismaModule } from "./prisma/prisma.module";
import { UserModule } from "./user/user.module";
import { AuthModule } from "./auth/auth.module";
import { AppController } from "./app.controller";
import { TripModule } from "./trip/trip.module";
import { CelebrateModule } from "./celebrate/celebrate.module";
import { ExpenseModule } from "./expense/expense.module";
import { TripMemberModule } from "./trip-member/tripmember.module";
import { StorageModule } from "./storage/storage.module";
import { ExpenseSplitModule } from "./expense-split/expense-split.module";
import { BudgetModule } from "./budget/budget.module";
import { NotificationModule } from "./notification/notification.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MulterModule.register({
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
    PrismaModule,
    UserModule,
    AuthModule,
    TripModule,
    CelebrateModule,
    ExpenseModule,
    TripMemberModule,
    StorageModule,
    ExpenseSplitModule,
    BudgetModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
