import {
  Controller,
  UseGuards,
  Post,
  Param,
  Body,
  Req,
  Get,
  Query,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { NotificationService } from "./notification.service";
import { SendReminderDto } from "./dto/send-reminder.dto";
import { PrismaService } from "src/prisma/prisma.service";

@Controller("notification")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags("Notification")
export class NotificationController {
  constructor(
    private notificationService: NotificationService,
    private prisma: PrismaService,
  ) {}

  /**
   * Send reminder notification to a specific user
   * POST /api/v1/notification/remind/:toUserId
   */
  @Post("remind/:toUserId")
  async sendReminder(
    @Req() req: any,
    @Param("toUserId") toUserId: string,
    @Body() dto: SendReminderDto,
  ) {
    const currentUserId = req.user.userId;

    // Validate that the current user and target user are trip members
    const sharedTrip = await this.prisma.tripMember.findFirst({
      where: {
        AND: [
          { userId: currentUserId },
          {
            trip: {
              members: {
                some: { userId: toUserId },
              },
            },
          },
        ],
      },
    });

    if (!sharedTrip) {
      throw new Error("Users are not members of the same trip");
    }

    // Get current user name
    const currentUser = await this.prisma.user.findUnique({
      where: { id: currentUserId },
      select: { fullName: true },
    });

    // Send reminder
    await this.notificationService.sendReminder(
      toUserId,
      currentUser.fullName,
      0,
      dto.message,
    );

    return { message: "Reminder sent successfully" };
  }

  /**
   * Get current user notifications
   * GET /api/v1/notification?limit=20&offset=0
   */
  @Get()
  async getNotifications(
    @Req() req: any,
    @Query("limit") limit = "20",
    @Query("offset") offset = "0",
  ) {
    return this.notificationService.getUserNotifications(
      req.user.userId,
      parseInt(limit),
      parseInt(offset),
    );
  }

  /**
   * Mark notification as read
   * POST /api/v1/notification/:id/read
   */
  @Post(":id/read")
  async markAsRead(@Param("id") notificationId: string) {
    return this.notificationService.markAsRead(notificationId);
  }
}
