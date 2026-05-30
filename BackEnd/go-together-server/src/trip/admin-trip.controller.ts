import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { TripService } from "./trip.service";

@ApiTags("Admin Trips")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("admin/trips")
export class AdminTripController {
  constructor(private readonly tripService: TripService) {}

  @Get()
  getTrips(
    @Query("query") query = "",
    @Query("status") status = "",
    @Query("page") page = "1",
    @Query("limit") limit = "10",
  ) {
    return this.tripService.getAdminTrips(query, status, Number(page), Number(limit));
  }

  @Get(":id")
  getTripDetail(@Param("id") id: string) {
    return this.tripService.getAdminTripDetail(id);
  }

  @Post()
  createTrip(@Body() body: any) {
    return this.tripService.createAdminTrip(body);
  }

  @Put(":id")
  updateTrip(@Param("id") id: string, @Body() body: any) {
    return this.tripService.updateAdminTrip(id, body);
  }

  @Delete(":id")
  deleteTrip(@Param("id") id: string) {
    return this.tripService.deleteAdminTrip(id);
  }
}
