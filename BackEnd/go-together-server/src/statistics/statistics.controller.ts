import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { Controller, Get, Query, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { StatisticsService } from "./statistics.service";

@Controller("statistics")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags("Statistics")
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get("spending")
  getSpendingStatistics(
    @Req() req: Request,
    @Query("tripId") tripId?: string,
    @Query("month") month?: string,
    @Query("year") year?: string,
  ) {
    const userId = (req as any).user.userId;
    return this.statisticsService.getSpendingStatistics(
      userId,
      tripId,
      Number(month),
      Number(year),
    );
  }
}
