import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { JwtService } from "@nestjs/jwt";
import { SocketEvents, SocketRooms } from "./socket-events.enum";

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

@WebSocketGateway({
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: false,
  },
  transports: ["websocket", "polling"],
  path: "/socket.io/",
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, AuthenticatedSocket>();

  constructor(private jwtService: JwtService) {}

  /**
   * Handle client connection
   * Authenticate via token and store connection
   */
  async handleConnection(client: AuthenticatedSocket) {
    try {
      let token: string | undefined;
      if (
        client.handshake &&
        typeof client.handshake === "object" &&
        "auth" in client.handshake
      ) {
        const auth = (client.handshake as any).auth;
        token = auth?.token?.split(" ")[1] || auth?.token;
      }

      // Method 2: From headers if not found in auth
      if (!token && client.handshake && "headers" in client.handshake) {
        const headers = (client.handshake as any).headers;
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
      this.connectedUsers.set(client.userId as string, client);
    } catch (error: any) {
      console.error("Full error:", error);
      client.disconnect(true);
    }
  }

  /**
   * Handle client disconnection
   */
  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.connectedUsers.delete(client.userId);
      console.log(`✗ User disconnected: ${client.userId}`);
    }
  }

  /**
   * Join trip room - called when user views trip details
   */
  @SubscribeMessage(SocketEvents.JOIN_TRIP)
  handleJoinTrip(client: AuthenticatedSocket, tripId: string) {
    if (!tripId) return;
    const room = SocketRooms.trip(tripId);
    client.join(room);
  }

  /**
   * Leave trip room - called when user leaves trip details
   */
  @SubscribeMessage(SocketEvents.LEAVE_TRIP)
  handleLeaveTrip(client: AuthenticatedSocket, tripId: string) {
    if (!tripId) return;
    const room = SocketRooms.trip(tripId);
    client.leave(room);
    console.log(`✗ ${client.userId} left trip room: ${tripId}`);
  }

  /**
   * Emit payment marked notification
   * @param tripId - Trip ID for room targeting
   * @param data - Notification payload
   */
  emitPaymentMarked(tripId: string, data: any) {
    this.server
      .to(SocketRooms.trip(tripId))
      .emit(SocketEvents.PAYMENT_MARKED, data);
  }

  /**
   * Emit payment confirmed notification
   * @param tripId - Trip ID for room targeting
   * @param data - Notification payload
   */
  emitPaymentConfirmed(tripId: string, data: any) {
    this.server
      .to(SocketRooms.trip(tripId))
      .emit(SocketEvents.PAYMENT_CONFIRMED, data);
  }

  /**
   * Emit expense created notification
   * @param tripId - Trip ID for room targeting
   * @param data - Notification payload
   */
  emitExpenseCreated(tripId: string, data: any) {
    this.server
      .to(SocketRooms.trip(tripId))
      .emit(SocketEvents.EXPENSE_CREATED, data);
  }

  /**
   * Emit trip invite notification
   * @param userId - User ID who should receive invite
   * @param data - Notification payload
   */
  emitUserInvited(userId: string, data: any) {
    this.server
      .to(SocketRooms.user(userId))
      .emit(SocketEvents.USER_INVITED, data);
  }

  /**
   * Emit member joined notification
   * @param tripId - Trip ID for room targeting
   * @param data - Notification payload
   */
  emitMemberJoined(tripId: string, data: any) {
    this.server
      .to(SocketRooms.trip(tripId))
      .emit(SocketEvents.MEMBER_JOINED, data);
  }

  /**
   * Emit invitation rejected notification (to owner)
   * @param userId - Owner's user ID
   * @param data - Notification payload
   */
  emitInviteRejected(userId: string, data: any) {
    this.server
      .to(SocketRooms.user(userId))
      .emit(SocketEvents.INVITE_REJECTED, data);
  }

  /**
   * Emit reminder notification
   * @param userId - User ID who should receive reminder
   * @param data - Notification payload
   */
  emitReminder(userId: string, data: any) {
    this.server.to(SocketRooms.user(userId)).emit(SocketEvents.REMINDER, data);
  }
}
