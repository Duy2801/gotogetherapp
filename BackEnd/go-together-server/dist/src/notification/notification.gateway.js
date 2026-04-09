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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const jwt_1 = require("@nestjs/jwt");
const socket_events_enum_1 = require("./socket-events.enum");
let NotificationGateway = class NotificationGateway {
    jwtService;
    server;
    connectedUsers = new Map();
    constructor(jwtService) {
        this.jwtService = jwtService;
    }
    async handleConnection(client) {
        try {
            let token;
            if (client.handshake &&
                typeof client.handshake === "object" &&
                "auth" in client.handshake) {
                const auth = client.handshake.auth;
                token = auth?.token?.split(" ")[1] || auth?.token;
            }
            if (!token && client.handshake && "headers" in client.handshake) {
                const headers = client.handshake.headers;
                token = headers?.authorization?.split(" ")[1];
            }
            if (!token) {
                client.disconnect(true);
                return;
            }
            const payload = this.jwtService.verify(token, {
                secret: process.env.JWT_SECRET,
            });
            client.userId = payload.sub || payload.id;
            this.connectedUsers.set(client.userId, client);
            const userRoom = socket_events_enum_1.SocketRooms.user(client.userId);
            client.join(userRoom);
            console.log(`✓ User connected and joined room: ${userRoom}`);
        }
        catch (error) {
            console.error("Full error:", error);
            client.disconnect(true);
        }
    }
    handleDisconnect(client) {
        if (client.userId) {
            this.connectedUsers.delete(client.userId);
            console.log(`✗ User disconnected: ${client.userId}`);
        }
    }
    handleJoinTrip(client, tripId) {
        if (!tripId)
            return;
        const room = socket_events_enum_1.SocketRooms.trip(tripId);
        client.join(room);
    }
    handleLeaveTrip(client, tripId) {
        if (!tripId)
            return;
        const room = socket_events_enum_1.SocketRooms.trip(tripId);
        client.leave(room);
        console.log(`✗ ${client.userId} left trip room: ${tripId}`);
    }
    emitPaymentMarked(tripId, data) {
        this.server
            .to(socket_events_enum_1.SocketRooms.trip(tripId))
            .emit(socket_events_enum_1.SocketEvents.PAYMENT_MARKED, data);
    }
    emitPaymentConfirmed(tripId, data) {
        this.server
            .to(socket_events_enum_1.SocketRooms.trip(tripId))
            .emit(socket_events_enum_1.SocketEvents.PAYMENT_CONFIRMED, data);
    }
    emitExpenseCreated(tripId, data) {
        this.server
            .to(socket_events_enum_1.SocketRooms.trip(tripId))
            .emit(socket_events_enum_1.SocketEvents.EXPENSE_CREATED, data);
    }
    emitUserInvited(userId, data) {
        this.server
            .to(socket_events_enum_1.SocketRooms.user(userId))
            .emit(socket_events_enum_1.SocketEvents.USER_INVITED, data);
    }
    emitMemberJoined(tripId, data) {
        this.server
            .to(socket_events_enum_1.SocketRooms.trip(tripId))
            .emit(socket_events_enum_1.SocketEvents.MEMBER_JOINED, data);
    }
    emitInviteRejected(userId, data) {
        this.server
            .to(socket_events_enum_1.SocketRooms.user(userId))
            .emit(socket_events_enum_1.SocketEvents.INVITE_REJECTED, data);
    }
    emitReminder(userId, data) {
        const room = socket_events_enum_1.SocketRooms.user(userId);
        const socketsInRoom = this.server.sockets.adapter.rooms?.get(room);
        const socketCount = socketsInRoom ? socketsInRoom.size : 0;
        if (socketCount === 0) {
            console.warn(`⚠️  WARNING: No sockets found in room ${room}!`);
        }
    }
};
exports.NotificationGateway = NotificationGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], NotificationGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)(socket_events_enum_1.SocketEvents.JOIN_TRIP),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], NotificationGateway.prototype, "handleJoinTrip", null);
__decorate([
    (0, websockets_1.SubscribeMessage)(socket_events_enum_1.SocketEvents.LEAVE_TRIP),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], NotificationGateway.prototype, "handleLeaveTrip", null);
exports.NotificationGateway = NotificationGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            credentials: false,
        },
        transports: ["websocket", "polling"],
        path: "/socket.io/",
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], NotificationGateway);
//# sourceMappingURL=notification.gateway.js.map