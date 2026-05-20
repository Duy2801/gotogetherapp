import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateCelebrateDTO } from "./dto/celebrate.dto";
import { UpdateCelebrateDTO } from "./dto/update-celebrate.dto";
import { CreateCommentDTO } from "./dto/create-comment.dto";
import { ToggleReactionDTO } from "./dto/toggle-reaction.dto";

@Injectable()
export class CelebrateService {
  constructor(private prisma: PrismaService) {}

  // inject gateway dynamically to avoid circular provider issues in some setups
  private gateway: any | null = null;
  setGateway(gw: any) {
    this.gateway = gw;
  }

  async getAllCelebrate(userId: string) {
    // return celebrates created by the user OR celebrates in trips where the user is a member
    const celebrate = this.prisma.celebrate.findMany({
      where: {
        OR: [
          { userId },
          { trip: { members: { some: { userId } } } },
        ],
      },
      include: {
        trip: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
            images: true,
            status: true,
          },
        },
        user: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
          },
        },
        images: true,
      },
      orderBy: { date: "desc" },
    });

    return celebrate;
  }
  async createCelebrate(userId: string, data: CreateCelebrateDTO) {
    const imageList = Array.isArray(data.images) ? data.images : [];
    const celebrate = await this.prisma.celebrate.create({
      data: {
        userId,
        tripId: data.tripId,
        description: data.description,
        date: new Date(data.date),
        images: {
          create: imageList.map((img) => ({
            imageUrl: img,
          })),
        },
      },
      include: {
        images: true,
      },
    });
    return celebrate;
  }
  async updateCelebrate(
    celebrateId: string,
    userId: string,
    data: UpdateCelebrateDTO,
  ) {
    const celebrate = await this.prisma.celebrate.findUnique({
      where: { id: celebrateId },
    });

    if (!celebrate) throw new NotFoundException("Celebrate not found");
    if (celebrate.userId !== userId)
      throw new ForbiddenException("celebrate.forbidden");

    return this.prisma.celebrate.update({
      where: { id: celebrateId },
      data: {
        ...(data.date && { date: new Date(data.date) }),
        ...(data.description !== undefined && {
          description: data.description,
        }),

        ...(data.images && {
          images: {
            deleteMany: {},
            create: data.images.map((img) => ({
              imageUrl: img,
            })),
          },
        }),
      },
      include: {
        images: true,
      },
    });
  }

  /* Comments & Reactions */
  async getComments(celebrateId: string, currentUserId?: string) {
    // ensure the requesting user is a member of the trip or the comment owner can still view
    if (currentUserId) {
      const celebrate = await this.prisma.celebrate.findUnique({ where: { id: celebrateId } });
      if (!celebrate) throw new NotFoundException('Celebrate not found');

      const member = await this.prisma.tripMember.findUnique({ where: { tripId_userId: { tripId: celebrate.tripId, userId: currentUserId } } });
      if (!member && celebrate.userId !== currentUserId) {
        throw new ForbiddenException('celebrate.forbidden');
      }
    }

    return (this.prisma as any).celebrateComment.findMany({
      where: { celebrateId },
      include: { user: { select: { id: true, fullName: true, avatar: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createComment(userId: string, celebrateId: string, dto: CreateCommentDTO) {
    const celebrate = await this.prisma.celebrate.findUnique({ where: { id: celebrateId } });
    if (!celebrate) throw new NotFoundException('Celebrate not found');

    // only trip members or the celebrate owner may post comments
    const member = await this.prisma.tripMember.findUnique({ where: { tripId_userId: { tripId: celebrate.tripId, userId } } });
    if (!member && celebrate.userId !== userId) {
      throw new ForbiddenException('celebrate.forbidden');
    }

    const comment = await (this.prisma as any).celebrateComment.create({
      data: {
        celebrateId,
        userId,
        content: dto.content,
      },
      include: { user: { select: { id: true, fullName: true, avatar: true } } },
    });

    try {
      this.gateway?.server?.emit('celebrate.comment.created', { celebrateId, comment });
    } catch (err) {
      // ignore websocket errors
    }

    return comment;
  }

  async getReactions(celebrateId: string, currentUserId?: string) {
    if (currentUserId) {
      const celebrate = await this.prisma.celebrate.findUnique({ where: { id: celebrateId } });
      if (!celebrate) throw new NotFoundException('Celebrate not found');
      const member = await this.prisma.tripMember.findUnique({ where: { tripId_userId: { tripId: celebrate.tripId, userId: currentUserId } } });
      if (!member && celebrate.userId !== currentUserId) {
        throw new ForbiddenException('celebrate.forbidden');
      }
    }

    const reactions = await (this.prisma as any).celebrateReaction.findMany({ where: { celebrateId } });
    const counts: Record<string, number> = {};
    let userReactions: string[] = [];
    for (const r of reactions) {
      counts[r.emoji] = (counts[r.emoji] || 0) + 1;
      if (r.userId === currentUserId) userReactions.push(r.emoji);
    }
    return { counts, userReactions };
  }

  async toggleReaction(userId: string, celebrateId: string, dto: ToggleReactionDTO) {
    const celebrate = await this.prisma.celebrate.findUnique({ where: { id: celebrateId } });
    if (!celebrate) throw new NotFoundException('Celebrate not found');

    // only trip members or celebrate owner can toggle reactions
    const member = await this.prisma.tripMember.findUnique({ where: { tripId_userId: { tripId: celebrate.tripId, userId } } });
    if (!member && celebrate.userId !== userId) {
      throw new ForbiddenException('celebrate.forbidden');
    }

    const existing = await (this.prisma as any).celebrateReaction.findUnique({
      where: { celebrateId_userId_emoji: { celebrateId, userId, emoji: dto.emoji } },
    });

    if (existing) {
      await (this.prisma as any).celebrateReaction.delete({ where: { id: existing.id } });
    } else {
      await (this.prisma as any).celebrateReaction.create({
        data: { celebrateId, userId, emoji: dto.emoji },
      });
    }

    const summary = await this.getReactions(celebrateId, userId);
    try {
      this.gateway?.server?.emit('celebrate.reaction.toggled', { celebrateId, summary });
    } catch (err) {
      // ignore websocket errors
    }

    return summary;
  }
}
