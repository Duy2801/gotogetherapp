export declare const UserStatus: {
    readonly ACTIVE: "ACTIVE";
    readonly INACTIVE: "INACTIVE";
    readonly BANNED: "BANNED";
};
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];
export declare const TripStatus: {
    readonly UPCOMING: "UPCOMING";
    readonly ONGOING: "ONGOING";
    readonly COMPLETED: "COMPLETED";
    readonly ARCHIVED: "ARCHIVED";
};
export type TripStatus = (typeof TripStatus)[keyof typeof TripStatus];
export declare const MemberRole: {
    readonly OWNER: "OWNER";
    readonly MEMBER: "MEMBER";
};
export type MemberRole = (typeof MemberRole)[keyof typeof MemberRole];
export declare const InviteStatus: {
    readonly PENDING: "PENDING";
    readonly ACCEPTED: "ACCEPTED";
    readonly REJECTED: "REJECTED";
};
export type InviteStatus = (typeof InviteStatus)[keyof typeof InviteStatus];
export declare const ExpenseType: {
    readonly SHARED: "SHARED";
    readonly PERSONAL: "PERSONAL";
};
export type ExpenseType = (typeof ExpenseType)[keyof typeof ExpenseType];
export declare const SplitType: {
    readonly EQUAL: "EQUAL";
    readonly PERCENTAGE: "PERCENTAGE";
    readonly AMOUNT: "AMOUNT";
};
export type SplitType = (typeof SplitType)[keyof typeof SplitType];
export declare const NotificationType: {
    readonly TRIP_INVITE: "TRIP_INVITE";
    readonly MEMBER_JOINED: "MEMBER_JOINED";
    readonly EXPENSE_CREATED: "EXPENSE_CREATED";
    readonly BUDGET_WARNING: "BUDGET_WARNING";
    readonly SETTLEMENT_REMINDER: "SETTLEMENT_REMINDER";
    readonly EXPENSE_REMINDER: "EXPENSE_REMINDER";
    readonly PAYMENT_MARKED: "PAYMENT_MARKED";
    readonly PAYMENT_CONFIRMED: "PAYMENT_CONFIRMED";
    readonly INVITATION_REJECTED: "INVITATION_REJECTED";
};
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];
