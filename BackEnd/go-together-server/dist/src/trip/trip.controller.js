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
exports.TripController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const trip_service_1 = require("./trip.service");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const create_trip_dto_1 = require("./dto/create-trip-dto");
let TripController = class TripController {
    tripService;
    constructor(tripService) {
        this.tripService = tripService;
    }
    getAllTrip(req, status, page, limit) {
        const userId = req.user.userId;
        return this.tripService.getAllTrip(userId, {
            status,
            page: Number(page),
            limit: Number(limit),
        });
    }
    getTripDetail(tripId) {
        console.log("🔍 GET /trips/:tripId/detail called with tripId:", tripId);
        return this.tripService.getTripDetail(tripId);
    }
    createTrip(req, dto) {
        const userId = req.user.userId;
        return this.tripService.createTrip(userId, dto);
    }
    getTotalAmoutAndQuantity(tripId) {
        return this.tripService.getTotalAmoutAndQuantity(tripId);
    }
    deleteTrip(req, tripId) {
        const userId = req.user.userId;
        return this.tripService.deleteTrip(userId, tripId);
    }
};
exports.TripController = TripController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)("status")),
    __param(2, (0, common_1.Query)("page")),
    __param(3, (0, common_1.Query)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Request, String, Number, Number]),
    __metadata("design:returntype", void 0)
], TripController.prototype, "getAllTrip", null);
__decorate([
    (0, common_1.Get)(":tripId/detail"),
    __param(0, (0, common_1.Param)("tripId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TripController.prototype, "getTripDetail", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Request, create_trip_dto_1.CreateTripDTO]),
    __metadata("design:returntype", void 0)
], TripController.prototype, "createTrip", null);
__decorate([
    (0, common_1.Get)(":tripId/total-amout"),
    __param(0, (0, common_1.Param)("tripId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TripController.prototype, "getTotalAmoutAndQuantity", null);
__decorate([
    (0, common_1.Delete)(":tripId"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("tripId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Request, String]),
    __metadata("design:returntype", void 0)
], TripController.prototype, "deleteTrip", null);
exports.TripController = TripController = __decorate([
    (0, swagger_1.ApiTags)("Trip"),
    (0, common_1.Controller)("trips"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [trip_service_1.TripService])
], TripController);
//# sourceMappingURL=trip.controller.js.map