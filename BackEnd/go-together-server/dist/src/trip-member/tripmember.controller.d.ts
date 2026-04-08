import { InviteMemberDto } from "./dto/InviteMemberDto";
import { RespondInvitationDto } from "./dto/RespondInvitationDto";
import { TripMemberService } from "./tripmember.service";
export declare class TripMemberController {
    private tripMemberService;
    constructor(tripMemberService: TripMemberService);
    getTripMember(req: Request, tripId: string): Promise<({
        user: {
            id: string;
            email: string;
            fullName: string | null;
            avatar: string | null;
        };
    } & {
        id: string;
        tripId: string;
        userId: string;
        role: import("../../prisma/generated/enums").MemberRole;
        inviteStatus: import("../../prisma/generated/enums").InviteStatus;
        joinedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        leftAt: Date | null;
    })[]>;
    inviteMember(req: Request, tripId: string, dto: InviteMemberDto): Promise<{
        user: {
            id: string;
            email: string;
            fullName: string | null;
            avatar: string | null;
        };
    } & {
        id: string;
        tripId: string;
        userId: string;
        role: import("../../prisma/generated/enums").MemberRole;
        inviteStatus: import("../../prisma/generated/enums").InviteStatus;
        joinedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        leftAt: Date | null;
    }>;
    respondInvitaion(req: Request, tripId: string, dto: RespondInvitationDto): Promise<{
        id: string;
        tripId: string;
        userId: string;
        role: import("../../prisma/generated/enums").MemberRole;
        inviteStatus: import("../../prisma/generated/enums").InviteStatus;
        joinedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        leftAt: Date | null;
    }>;
    leaveTrip(tripId: string, req: Request): Promise<{
        id: string;
        tripId: string;
        userId: string;
        role: import("../../prisma/generated/enums").MemberRole;
        inviteStatus: import("../../prisma/generated/enums").InviteStatus;
        joinedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        leftAt: Date | null;
    }>;
    transferOwner(tripId: string, userId: string, req: Request): Promise<[{
        id: string;
        tripId: string;
        userId: string;
        role: import("../../prisma/generated/enums").MemberRole;
        inviteStatus: import("../../prisma/generated/enums").InviteStatus;
        joinedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        leftAt: Date | null;
    }, {
        id: string;
        tripId: string;
        userId: string;
        role: import("../../prisma/generated/enums").MemberRole;
        inviteStatus: import("../../prisma/generated/enums").InviteStatus;
        joinedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        leftAt: Date | null;
    }]>;
}
