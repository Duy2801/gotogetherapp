import { PrismaService } from "src/prisma/prisma.service";
import { NotificationGateway } from "src/notification/notification.gateway";
export declare class TripMemberService {
    private prisma;
    private notificationGateway;
    constructor(prisma: PrismaService, notificationGateway: NotificationGateway);
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
        role: import("../../prisma/generated/enums").MemberRole;
        inviteStatus: import("../../prisma/generated/enums").InviteStatus;
        joinedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        leftAt: Date | null;
        tripId: string;
        userId: string;
    }>;
    repondInitation(userId: string, tripId: string, status: "ACCEPTED" | "REJECTED"): Promise<{
        id: string;
        role: import("../../prisma/generated/enums").MemberRole;
        inviteStatus: import("../../prisma/generated/enums").InviteStatus;
        joinedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        leftAt: Date | null;
        tripId: string;
        userId: string;
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
        role: import("../../prisma/generated/enums").MemberRole;
        inviteStatus: import("../../prisma/generated/enums").InviteStatus;
        joinedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        leftAt: Date | null;
        tripId: string;
        userId: string;
    })[]>;
    leaveTrip(userId: string, tripId: string): Promise<{
        id: string;
        role: import("../../prisma/generated/enums").MemberRole;
        inviteStatus: import("../../prisma/generated/enums").InviteStatus;
        joinedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        leftAt: Date | null;
        tripId: string;
        userId: string;
    }>;
    roleChange(userId: string, tripId: string, newOwnerId: string): Promise<[{
        id: string;
        role: import("../../prisma/generated/enums").MemberRole;
        inviteStatus: import("../../prisma/generated/enums").InviteStatus;
        joinedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        leftAt: Date | null;
        tripId: string;
        userId: string;
    }, {
        id: string;
        role: import("../../prisma/generated/enums").MemberRole;
        inviteStatus: import("../../prisma/generated/enums").InviteStatus;
        joinedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        leftAt: Date | null;
        tripId: string;
        userId: string;
    }]>;
}
