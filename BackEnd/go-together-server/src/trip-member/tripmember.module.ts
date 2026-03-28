import { Module } from "@nestjs/common";
import { NotificationModule } from "src/notification/notification.module";
import { TripMemberService } from "./tripmember.service";
import { TripMemberController } from "./tripmember.controller";

@Module({
  imports: [NotificationModule],
  controllers: [TripMemberController],
  providers: [TripMemberService],
  exports: [TripMemberService],
})
export class TripMemberModule {}
