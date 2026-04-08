import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { InviteMemberDto } from "./dto/InviteMemberDto";
import { RespondInvitationDto } from "./dto/RespondInvitationDto";
import { TripMemberService } from "./tripmember.service";

@Controller("tripMember")
@ApiTags("TripMember")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class TripMemberController {
  constructor(private tripMemberService: TripMemberService) {}

  @Get()
  getTripMember(@Req() req: Request, @Param("id") tripId: string) {
    const userId = (req as any).user.userId;
    return this.tripMemberService.getTripMembers(userId, tripId);
  }
  @Post(":tripId/invite")
  inviteMember(
    @Req() req: Request,
    @Param("tripId") tripId: string,
    @Body() dto: InviteMemberDto,
  ) {
    const userId = (req as any).user.userId;
    return this.tripMemberService.inviteMember(userId, tripId, dto.email);
  }
  @Post(":tripId/respond")
  respondInvitaion(
    @Req() req: Request,
    @Param("tripId") tripId: string,
    @Body() dto: RespondInvitationDto,
  ) {
    const userId = (req as any).user.userId;
    return this.tripMemberService.repondInitation(
      userId,
      tripId,
      dto.status as any,
    );
  }
  @Post(":tripId/leave")
  leaveTrip(@Param("tripId") tripId: string, @Req() req: Request) {
    const userId = (req as any).user.userId;
    return this.tripMemberService.leaveTrip(userId, tripId);
  }
  @Post(":tripId/transfer-ower/:userId")
  transferOwner(
    @Param("tripId") tripId: string,
    @Param("userId") userId: string,
    @Req() req: Request,
  ) {
    const user_Id = (req as any).user.userId;
    return this.tripMemberService.roleChange(user_Id, tripId, userId);
  }
}
