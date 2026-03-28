import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { NotificationGateway } from "src/notification/notification.gateway";

@Injectable()
export class TripMemberService {
  constructor(
    private prisma: PrismaService,
    private notificationGateway: NotificationGateway,
  ) {}

  async ensureTripMember(userId: string, tripId: string) {
    const member = await this.prisma.tripMember.findUnique({
      where: { tripId_userId: { tripId, userId } },
    });
    if (!member || member.inviteStatus !== "ACCEPTED") {
      throw new ForbiddenException("Bạn không thuộc chuyến đi này");
    }
  }
  async ensureTripOwner(userId: string, tripId: string) {
    const member = await this.prisma.tripMember.findUnique({
      where: { tripId_userId: { tripId, userId } },
    });
    if (!member) {
      throw new ForbiddenException("Bạn không thuộc chuyến đi này");
    }
    if (member.role !== "OWNER") {
      throw new ForbiddenException(
        "Bạn không có quyền thực hiện thao tác này. Chỉ chủ chuyến đi mới có quyền mời thành viên.",
      );
    }
  }
  async inviteMember(ownerId: string, tripId: string, email: string) {
    console.log(
      `[InviteMember] User ${ownerId} inviting ${email} to trip ${tripId}`,
    );

    await this.ensureTripOwner(ownerId, tripId);

    const expenseCount = await this.prisma.expense.count({
      where: { tripId },
    });
    console.log(`[InviteMember] Trip has ${expenseCount} expenses`);

    if (expenseCount > 0) {
      throw new BadRequestException(
        "Không thể thêm thành viên khi đã có chi tiêu trong chuyến đi",
      );
    }

    const inviteUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!inviteUser) {
      console.log(`[InviteMember] User not found with email: ${email}`);
      throw new NotFoundException("Không tìm thấy người dùng với email này");
    }

    console.log(
      `[InviteMember] Found user: ${inviteUser.id} - ${inviteUser.fullName}`,
    );

    const existingMember = await this.prisma.tripMember.findUnique({
      where: { tripId_userId: { tripId, userId: inviteUser.id } },
    });

    if (existingMember) {
      if (existingMember.inviteStatus === "ACCEPTED") {
        throw new BadRequestException("Người dùng đã là thành viên");
      }
      if (existingMember.inviteStatus === "PENDING") {
        throw new BadRequestException("Lời mời đã được gửi trước đó");
      }
    }

    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      select: { name: true },
    });

    const owner = await this.prisma.user.findUnique({
      where: { id: ownerId },
      select: { fullName: true },
    });

    if (!trip) {
      throw new NotFoundException("Trip not found");
    }

    if (!owner) {
      throw new NotFoundException("User not found");
    }

    const member = await this.prisma.tripMember.create({
      data: {
        tripId,
        userId: inviteUser.id,
        role: "MEMBER",
        inviteStatus: "PENDING",
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    // Emit invitation notification to invited user
    this.notificationGateway.emitUserInvited(inviteUser.id, {
      type: "TRIP_INVITE",
      title: `Lời mời từ ${owner.fullName}`,
      message: `${owner.fullName} đã mời bạn tham gia chuyến đi "${trip.name}"`,
      tripId,
      tripName: trip.name,
      invitedBy: owner.fullName,
      timestamp: new Date(),
    });

    console.log(
      `[InviteMember] Successfully created invitation for ${inviteUser.email}`,
    );
    return member;
  }
  async repondInitation(
    userId: string,
    tripId: string,
    status: "ACCEPTED" | "REJECTED",
  ) {
    const member = await this.prisma.tripMember.findUnique({
      where: { tripId_userId: { tripId, userId } },
      include: {
        user: { select: { fullName: true } },
        trip: {
          select: {
            name: true,
            members: {
              where: { role: "OWNER" },
              select: { userId: true },
            },
          },
        },
      },
    });

    if (!member) {
      throw new NotFoundException("Không tìm thấy lời mời");
    }
    if (member.inviteStatus !== "PENDING") {
      throw new BadRequestException("Lời mời đã được xử lý");
    }

    if (status === "ACCEPTED") {
      const updated = await this.prisma.tripMember.update({
        where: { tripId_userId: { tripId, userId } },
        data: {
          inviteStatus: "ACCEPTED",
          joinedAt: new Date(),
        },
      });

      // Emit member joined notification to all trip members
      this.notificationGateway.emitMemberJoined(tripId, {
        type: "MEMBER_JOINED",
        title: "Thành viên mới",
        message: `${member.user.fullName} đã chấp nhận lời mời tham gia chuyến đi`,
        memberName: member.user.fullName,
        tripName: member.trip.name,
        timestamp: new Date(),
      });

      return updated;
    } else {
      const deleted = await this.prisma.tripMember.delete({
        where: { tripId_userId: { tripId, userId } },
      });

      // Emit invite rejected notification to trip owner
      const ownerId = member.trip.members[0]?.userId;
      if (ownerId) {
        this.notificationGateway.emitInviteRejected(ownerId, {
          type: "INVITE_REJECTED",
          title: "Lời mời bị từ chối",
          message: `${member.user.fullName} đã từ chối lời mời tham gia chuyến đi "${member.trip.name}"`,
          memberName: member.user.fullName,
          tripName: member.trip.name,
          timestamp: new Date(),
        });
      }

      return deleted;
    }
  }
  async getTripMembers(userId: string, tripId: string) {
    await this.ensureTripMember(userId, tripId);

    const members = await this.prisma.tripMember.findMany({
      where: { tripId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: [{ role: "desc" }, { createdAt: "asc" }],
    });
    return members;
  }
  async leaveTrip(userId: string, tripId: string) {
    const member = await this.prisma.tripMember.findUnique({
      where: {
        tripId_userId: { tripId, userId },
      },
    });
    if (!member) {
      throw new NotFoundException("Bạn không thuộc chuyến đi này");
    }
    if (member.leftAt) {
      throw new BadRequestException("Bạn đã rời chuyến đi trước đó");
    }
    if (member.role === "OWNER") {
      throw new BadRequestException(
        "Chủ chuyến đi phải chuyển quyền trước khi rời nhóm",
      );
    }
    return this.prisma.tripMember.update({
      where: {
        tripId_userId: { tripId, userId },
      },
      data: {
        leftAt: new Date(),
      },
    });
  }
  async roleChange(userId: string, tripId: string, newOwnerId: string) {
    const currentMember = await this.prisma.tripMember.findUnique({
      where: {
        tripId_userId: { tripId, userId },
      },
    });
    if (!currentMember) {
      throw new Error("Bạn không thuộc chuyến đi này");
    }

    if (currentMember.role !== "OWNER") {
      throw new Error("Chỉ chủ chuyến đi mới được chuyển quyền");
    }
    const newOwner = await this.prisma.tripMember.findUnique({
      where: {
        tripId_userId: { tripId, userId: newOwnerId },
      },
    });
    if (!newOwner) {
      throw new Error("Người này không thuộc chuyến đi");
    }
    if (newOwner.leftAt) {
      throw new Error("Người này đã rời chuyến đi");
    }
    return this.prisma.$transaction([
      this.prisma.tripMember.update({
        where: {
          tripId_userId: { tripId, userId },
        },
        data: {
          role: "MEMBER",
        },
      }),
      this.prisma.tripMember.update({
        where: { tripId_userId: { tripId, userId: newOwnerId } },
        data: {
          role: "OWNER",
        },
      }),
    ]);
  }
}
