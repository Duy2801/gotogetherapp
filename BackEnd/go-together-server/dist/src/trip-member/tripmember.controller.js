"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TripMemberController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const InviteMemberDto_1 = require("./dto/InviteMemberDto");
const RespondInvitationDto_1 = require("./dto/RespondInvitationDto");
const tripmember_service_1 = require("./tripmember.service");
let TripMemberController = class TripMemberController {
    tripMemberService;
    constructor(tripMemberService) {
        this.tripMemberService = tripMemberService;
    }
    getTripMember(req, tripId) {
        const userId = req.user.userId;
        return this.tripMemberService.getTripMembers(userId, tripId);
    }
    inviteMember(req, tripId, dto) {
        const userId = req.user.userId;
        return this.tripMemberService.inviteMember(userId, tripId, dto.email);
    }
    respondInvitaion(req, tripId, dto) {
        const userId = req.user.userId;
        return this.tripMemberService.repondInitation(userId, tripId, dto.status);
    }
    leaveTrip(tripId, req) {
        const userId = req.user.userId;
        return this.tripMemberService.leaveTrip(userId, tripId);
    }
    transferOwner(tripId, userId, req) {
        const user_Id = req.user.userId;
        return this.tripMemberService.roleChange(user_Id, tripId, userId);
    }
};
exports.TripMemberController = TripMemberController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Request, String]),
    __metadata("design:returntype", void 0)
], TripMemberController.prototype, "getTripMember", null);
__decorate([
    (0, common_1.Post)(":tripId/invite"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("tripId")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Request, String, InviteMemberDto_1.InviteMemberDto]),
    __metadata("design:returntype", void 0)
], TripMemberController.prototype, "inviteMember", null);
__decorate([
    (0, common_1.Post)(":tripId/respond"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("tripId")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Request, String, RespondInvitationDto_1.RespondInvitationDto]),
    __metadata("design:returntype", void 0)
], TripMemberController.prototype, "respondInvitaion", null);
__decorate([
    (0, common_1.Post)(":tripId/leave"),
    __param(0, (0, common_1.Param)("tripId")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Request]),
    __metadata("design:returntype", void 0)
], TripMemberController.prototype, "leaveTrip", null);
__decorate([
    (0, common_1.Post)(":tripId/transfer-ower/:userId"),
    __param(0, (0, common_1.Param)("tripId")),
    __param(1, (0, common_1.Param)("userId")),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Request]),
    __metadata("design:returntype", void 0)
], TripMemberController.prototype, "transferOwner", null);
exports.TripMemberController = TripMemberController = __decorate([
    (0, common_1.Controller)("tripMember"),
    (0, swagger_1.ApiTags)("TripMember"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [tripmember_service_1.TripMemberService])
], TripMemberController);
//# sourceMappingURL=tripmember.controller.js.map