import { Module } from "@nestjs/common";
import { NotificationService } from "./notification.service";
import { NotificationGateway } from "./notification.gateway";
import { NotificationController } from "./notification.controller";

@Module({
  imports: [],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationGateway],
  exports: [NotificationService, NotificationGateway],
})
export class NotificationModule {}
