import { Module } from "@nestjs/common";
import { CelebrateController } from "./celebrate.controller";
import { CelebrateService } from "./celebrate.service";
import { CelebrateGateway } from "./celebrate.gateway";

@Module({
  imports: [],
  controllers: [CelebrateController],
  providers: [CelebrateService, CelebrateGateway],
})
export class CelebrateModule {}
