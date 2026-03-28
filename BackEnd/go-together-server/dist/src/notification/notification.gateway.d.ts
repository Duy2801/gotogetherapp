import { OnGatewayConnection, OnGatewayDisconnect } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { JwtService } from "@nestjs/jwt";
interface AuthenticatedSocket extends Socket {
    userId?: string;
}
export declare class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private jwtService;
    server: Server;
    private connectedUsers;
    constructor(jwtService: JwtService);
    handleConnection(client: AuthenticatedSocket): Promise<void>;
    handleDisconnect(client: AuthenticatedSocket): void;
    handleJoinTrip(client: AuthenticatedSocket, tripId: string): void;
    handleLeaveTrip(client: AuthenticatedSocket, tripId: string): void;
    emitPaymentMarked(tripId: string, data: any): void;
    emitPaymentConfirmed(tripId: string, data: any): void;
    emitExpenseCreated(tripId: string, data: any): void;
    emitUserInvited(userId: string, data: any): void;
    emitMemberJoined(tripId: string, data: any): void;
    emitInviteRejected(userId: string, data: any): void;
    emitReminder(userId: string, data: any): void;
}
export {};
