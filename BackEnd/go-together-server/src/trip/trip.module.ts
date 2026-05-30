import { Module } from "@nestjs/common";
import { AdminTripController } from "./admin-trip.controller";
import { TripController } from "./trip.controller";
import { TripService } from "./trip.service";

@Module({
  imports: [],
  controllers: [TripController, AdminTripController],
  providers: [TripService],
  exports: [TripService],
})
export class TripModule {}
