import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { TripService } from "./trip.service";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { CreateExpenseDto } from "./dto/create-expense.dto";
import { CreateTripDTO } from "./dto/create-trip-dto";
@ApiTags("Trip")
@Controller("trips")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class TripController {
  constructor(private tripService: TripService) {}
  @Get()
  getAllTrip(
    @Req() req: Request,
    @Query("status") status?: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
  ) {
    const userId = (req as any).user.userId;
    return this.tripService.getAllTrip(userId, {
      status,
      page: Number(page),
      limit: Number(limit),
    });
  }
  @Get(":tripId/detail")
  getTripDetail(@Param("tripId") tripId: string) {
    console.log("🔍 GET /trips/:tripId/detail called with tripId:", tripId);
    return this.tripService.getTripDetail(tripId);
  }
  @Post()
  createTrip(@Req() req: Request, @Body() dto: CreateTripDTO) {
    const userId = (req as any).user.userId;
    return this.tripService.createTrip(userId, dto);
  }
  @Get(":tripId/total-amout")
  getTotalAmoutAndQuantity(@Param("tripId") tripId: string) {
    return this.tripService.getTotalAmoutAndQuantity(tripId);
  }

  @Delete(":tripId")
  deleteTrip(@Req() req: Request, @Param("tripId") tripId: string) {
    const userId = (req as any).user.userId;
    return this.tripService.deleteTrip(userId, tripId);
  }
}
