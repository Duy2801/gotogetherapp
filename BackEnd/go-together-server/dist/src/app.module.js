"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const prisma_module_1 = require("./prisma/prisma.module");
const user_module_1 = require("./user/user.module");
const auth_module_1 = require("./auth/auth.module");
const app_controller_1 = require("./app.controller");
const trip_module_1 = require("./trip/trip.module");
const celebrate_module_1 = require("./celebrate/celebrate.module");
const expense_module_1 = require("./expense/expense.module");
const tripmember_module_1 = require("./trip-member/tripmember.module");
const storage_module_1 = require("./storage/storage.module");
const expense_split_module_1 = require("./expense-split/expense-split.module");
const budget_module_1 = require("./budget/budget.module");
const notification_module_1 = require("./notification/notification.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            platform_express_1.MulterModule.register({
                storage: (0, multer_1.memoryStorage)(),
                limits: {
                    fileSize: 10 * 1024 * 1024,
                },
            }),
            prisma_module_1.PrismaModule,
            user_module_1.UserModule,
            auth_module_1.AuthModule,
            trip_module_1.TripModule,
            celebrate_module_1.CelebrateModule,
            expense_module_1.ExpenseModule,
            tripmember_module_1.TripMemberModule,
            storage_module_1.StorageModule,
            expense_split_module_1.ExpenseSplitModule,
            budget_module_1.BudgetModule,
            notification_module_1.NotificationModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map