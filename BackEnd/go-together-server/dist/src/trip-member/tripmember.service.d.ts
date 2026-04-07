import { PrismaService } from "src/prisma/prisma.service";
import { NotificationGateway } from "src/notification/notification.gateway";
import { NotificationService } from "src/notification/notification.service";
export declare class TripMemberService {
    private prisma;
    private notificationGateway;
    private notificationService;
    constructor(prisma: PrismaService, notificationGateway: NotificationGateway, notificationService: NotificationService);
    ensureTripMember(userId: string, tripId: string): Promise<void>;
    ensureTripOwner(userId: string, tripId: string): Promise<void>;
    inviteMember(ownerId: string, tripId: string, email: string): Promise<{
        user: {
            id: string;
            email: string;
            fullName: string | null;
            avatar: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        tripId: string;
        role: import("../../prisma/generated/enums").MemberRole;
        inviteStatus: import("../../prisma/generated/enums").InviteStatus;
        joinedAt: Date | null;
        leftAt: Date | null;
    }>;
    repondInitation(userId: string, tripId: string, status: "ACCEPTED" | "REJECTED"): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        tripId: string;
        role: import("../../prisma/generated/enums").MemberRole;
        inviteStatus: import("../../prisma/generated/enums").InviteStatus;
        joinedAt: Date | null;
        leftAt: Date | null;
    }>;
    getTripMembers(userId: string, tripId: string): Promise<({
        user: {
            id: string;
            email: string;
            fullName: string | null;
            avatar: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        tripId: string;
        role: import("../../prisma/generated/enums").MemberRole;
        inviteStatus: import("../../prisma/generated/enums").InviteStatus;
        joinedAt: Date | null;
        leftAt: Date | null;
    })[]>;
    leaveTrip(userId: string, tripId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        tripId: string;
        role: import("../../prisma/generated/enums").MemberRole;
        inviteStatus: import("../../prisma/generated/enums").InviteStatus;
        joinedAt: Date | null;
        leftAt: Date | null;
    }>;
    roleChange(userId: string, tripId: string, newOwnerId: string): Promise<[{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        tripId: string;
        role: import("../../prisma/generated/enums").MemberRole;
        inviteStatus: import("../../prisma/generated/enums").InviteStatus;
        joinedAt: Date | null;
        leftAt: Date | null;
    }, {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        tripId: string;
        role: import("../../prisma/generated/enums").MemberRole;
        inviteStatus: import("../../prisma/generated/enums").InviteStatus;
        joinedAt: Date | null;
        leftAt: Date | null;
    }]>;
}
