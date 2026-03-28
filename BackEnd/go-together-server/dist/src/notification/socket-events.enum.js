"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketRooms = exports.SocketEvents = void 0;
var SocketEvents;
(function (SocketEvents) {
    SocketEvents["CONNECTION"] = "connection";
    SocketEvents["DISCONNECT"] = "disconnect";
    SocketEvents["ERROR"] = "error";
    SocketEvents["JOIN_TRIP"] = "join:trip";
    SocketEvents["LEAVE_TRIP"] = "leave:trip";
    SocketEvents["PAYMENT_MARKED"] = "trip:payment-marked";
    SocketEvents["PAYMENT_CONFIRMED"] = "trip:payment-confirmed";
    SocketEvents["EXPENSE_CREATED"] = "trip:expense-created";
    SocketEvents["USER_INVITED"] = "trip:user-invited";
    SocketEvents["INVITE_ACCEPTED"] = "trip:invite-accepted";
    SocketEvents["INVITE_REJECTED"] = "trip:invite-rejected";
    SocketEvents["MEMBER_JOINED"] = "trip:member-joined";
    SocketEvents["MEMBER_LEFT"] = "trip:member-left";
    SocketEvents["REMINDER"] = "trip:reminder";
})(SocketEvents || (exports.SocketEvents = SocketEvents = {}));
class SocketRooms {
    static trip(tripId) {
        return `tripId:${tripId}`;
    }
    static user(userId) {
        return `user:${userId}`;
    }
}
exports.SocketRooms = SocketRooms;
//# sourceMappingURL=socket-events.enum.js.map