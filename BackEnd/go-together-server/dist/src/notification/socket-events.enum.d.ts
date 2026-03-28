export declare enum SocketEvents {
    CONNECTION = "connection",
    DISCONNECT = "disconnect",
    ERROR = "error",
    JOIN_TRIP = "join:trip",
    LEAVE_TRIP = "leave:trip",
    PAYMENT_MARKED = "trip:payment-marked",
    PAYMENT_CONFIRMED = "trip:payment-confirmed",
    EXPENSE_CREATED = "trip:expense-created",
    USER_INVITED = "trip:user-invited",
    INVITE_ACCEPTED = "trip:invite-accepted",
    INVITE_REJECTED = "trip:invite-rejected",
    MEMBER_JOINED = "trip:member-joined",
    MEMBER_LEFT = "trip:member-left",
    REMINDER = "trip:reminder"
}
export declare class SocketRooms {
    static trip(tripId: string): string;
    static user(userId: string): string;
}
