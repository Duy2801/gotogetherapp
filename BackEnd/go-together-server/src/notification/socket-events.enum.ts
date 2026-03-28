/**
 * Socket.IO Event Constants
 * Used for real-time notifications across connected clients
 */
export enum SocketEvents {
  // Connection events
  CONNECTION = 'connection',
  DISCONNECT = 'disconnect',
  ERROR = 'error',

  // Room management
  JOIN_TRIP = 'join:trip',
  LEAVE_TRIP = 'leave:trip',

  // Trip expense notifications
  PAYMENT_MARKED = 'trip:payment-marked',
  PAYMENT_CONFIRMED = 'trip:payment-confirmed',
  EXPENSE_CREATED = 'trip:expense-created',

  // Trip member notifications
  USER_INVITED = 'trip:user-invited',
  INVITE_ACCEPTED = 'trip:invite-accepted',
  INVITE_REJECTED = 'trip:invite-rejected',
  MEMBER_JOINED = 'trip:member-joined',
  MEMBER_LEFT = 'trip:member-left',

  // Personal notifications
  REMINDER = 'trip:reminder',
}

/**
 * Socket.IO Room names
 * - tripId:<id> = room for all members of a trip
 * - user:<id> = room for individual user notifications
 */
export class SocketRooms {
  static trip(tripId: string): string {
    return `tripId:${tripId}`;
  }

  static user(userId: string): string {
    return `user:${userId}`;
  }
}
