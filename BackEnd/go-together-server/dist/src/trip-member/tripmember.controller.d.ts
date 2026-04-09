import { InviteMemberDto } from "./dto/InviteMemberDto";
import { RespondInvitationDto } from "./dto/RespondInvitationDto";
import { TripMemberService } from "./tripmember.service";
export declare class TripMemberController {
    private tripMemberService;
    constructor(tripMemberService: TripMemberService);
    getTripMember(req: Request, tripId: string): Promise<({
        user: {
            email: string;
            id: string;
            fullName: string | null;
            avatar: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        tripId: string;
        updatedAt: Date;
        role: import("../../prisma/generated/enums").MemberRole;
        inviteStatus: import("../../prisma/generated/enums").InviteStatus;
        joinedAt: Date | null;
        leftAt: Date | null;
    })[]>;
    inviteMember(req: Request, tripId: string, dto: InviteMemberDto): Promise<{
        user: {
            email: string;
            id: string;
            fullName: string | null;
            avatar: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        tripId: string;
        updatedAt: Date;
        role: import("../../prisma/generated/enums").MemberRole;
        inviteStatus: import("../../prisma/generated/enums").InviteStatus;
        joinedAt: Date | null;
        leftAt: Date | null;
    }>;
    respondInvitaion(req: Request, tripId: string, dto: RespondInvitationDto): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        tripId: string;
        updatedAt: Date;
        role: import("../../prisma/generated/enums").MemberRole;
        inviteStatus: import("../../prisma/generated/enums").InviteStatus;
        joinedAt: Date | null;
        leftAt: Date | null;
    }>;
    leaveTrip(tripId: string, req: Request): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        tripId: string;
        updatedAt: Date;
        role: import("../../prisma/generated/enums").MemberRole;
        inviteStatus: import("../../prisma/generated/enums").InviteStatus;
        joinedAt: Date | null;
        leftAt: Date | null;
    }>;
    transferOwner(tripId: string, userId: string, req: Request): Promise<[{
        id: string;
        createdAt: Date;
        userId: string;
        tripId: string;
        updatedAt: Date;
        role: import("../../prisma/generated/enums").MemberRole;
        inviteStatus: import("../../prisma/generated/enums").InviteStatus;
        joinedAt: Date | null;
        leftAt: Date | null;
    }, {
        id: string;
        createdAt: Date;
        userId: string;
        tripId: string;
        updatedAt: Date;
        role: import("../../prisma/generated/enums").MemberRole;
        inviteStatus: import("../../prisma/generated/enums").InviteStatus;
        joinedAt: Date | null;
        leftAt: Date | null;
    }]>;
}
