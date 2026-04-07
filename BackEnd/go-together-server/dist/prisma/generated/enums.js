"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationType = exports.SplitType = exports.ExpenseType = exports.InviteStatus = exports.MemberRole = exports.TripStatus = exports.UserStatus = void 0;
exports.UserStatus = {
    ACTIVE: "ACTIVE",
    INACTIVE: "INACTIVE",
    BANNED: "BANNED",
};
exports.TripStatus = {
    UPCOMING: "UPCOMING",
    ONGOING: "ONGOING",
    COMPLETED: "COMPLETED",
    ARCHIVED: "ARCHIVED",
};
exports.MemberRole = {
    OWNER: "OWNER",
    MEMBER: "MEMBER",
};
exports.InviteStatus = {
    PENDING: "PENDING",
    ACCEPTED: "ACCEPTED",
    REJECTED: "REJECTED",
};
exports.ExpenseType = {
    SHARED: "SHARED",
    PERSONAL: "PERSONAL",
};
exports.SplitType = {
    EQUAL: "EQUAL",
    PERCENTAGE: "PERCENTAGE",
    AMOUNT: "AMOUNT",
};
exports.NotificationType = {
    TRIP_INVITE: "TRIP_INVITE",
    MEMBER_JOINED: "MEMBER_JOINED",
    EXPENSE_CREATED: "EXPENSE_CREATED",
    BUDGET_WARNING: "BUDGET_WARNING",
    SETTLEMENT_REMINDER: "SETTLEMENT_REMINDER",
    EXPENSE_REMINDER: "EXPENSE_REMINDER",
    PAYMENT_MARKED: "PAYMENT_MARKED",
    PAYMENT_CONFIRMED: "PAYMENT_CONFIRMED",
    INVITATION_REJECTED: "INVITATION_REJECTED",
};
//# sourceMappingURL=enums.js.map