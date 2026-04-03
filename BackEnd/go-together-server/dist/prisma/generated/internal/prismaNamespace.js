"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryMode = exports.JsonNullValueFilter = exports.BudgetOrderByRelevanceFieldEnum = exports.ExpenseSplitOrderByRelevanceFieldEnum = exports.ExpenseOrderByRelevanceFieldEnum = exports.CategoryOrderByRelevanceFieldEnum = exports.TripMemberOrderByRelevanceFieldEnum = exports.TripOrderByRelevanceFieldEnum = exports.UserRoleOrderByRelevanceFieldEnum = exports.PermissionOrderByRelevanceFieldEnum = exports.RoleOrderByRelevanceFieldEnum = exports.UserOrderByRelevanceFieldEnum = exports.NullsOrder = exports.NullableJsonNullValueInput = exports.SortOrder = exports.CelebrateImageScalarFieldEnum = exports.CelebrateScalarFieldEnum = exports.DeviceScalarFieldEnum = exports.NotificationScalarFieldEnum = exports.ItineraryScalarFieldEnum = exports.BudgetScalarFieldEnum = exports.ExpenseSplitScalarFieldEnum = exports.ExpenseScalarFieldEnum = exports.CategoryScalarFieldEnum = exports.TripMemberScalarFieldEnum = exports.TripScalarFieldEnum = exports.RolePermissionScalarFieldEnum = exports.UserRoleScalarFieldEnum = exports.PermissionScalarFieldEnum = exports.RoleScalarFieldEnum = exports.UserScalarFieldEnum = exports.TransactionIsolationLevel = exports.ModelName = exports.AnyNull = exports.JsonNull = exports.DbNull = exports.NullTypes = exports.prismaVersion = exports.getExtensionContext = exports.Decimal = exports.Sql = exports.raw = exports.join = exports.empty = exports.sql = exports.PrismaClientValidationError = exports.PrismaClientInitializationError = exports.PrismaClientRustPanicError = exports.PrismaClientUnknownRequestError = exports.PrismaClientKnownRequestError = void 0;
exports.defineExtension = exports.CelebrateImageOrderByRelevanceFieldEnum = exports.CelebrateOrderByRelevanceFieldEnum = exports.DeviceOrderByRelevanceFieldEnum = exports.NotificationOrderByRelevanceFieldEnum = exports.ItineraryOrderByRelevanceFieldEnum = void 0;
const runtime = __importStar(require("@prisma/client/runtime/client"));
exports.PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError;
exports.PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError;
exports.PrismaClientRustPanicError = runtime.PrismaClientRustPanicError;
exports.PrismaClientInitializationError = runtime.PrismaClientInitializationError;
exports.PrismaClientValidationError = runtime.PrismaClientValidationError;
exports.sql = runtime.sqltag;
exports.empty = runtime.empty;
exports.join = runtime.join;
exports.raw = runtime.raw;
exports.Sql = runtime.Sql;
exports.Decimal = runtime.Decimal;
exports.getExtensionContext = runtime.Extensions.getExtensionContext;
exports.prismaVersion = {
    client: "7.3.0",
    engine: "9d6ad21cbbceab97458517b147a6a09ff43aa735"
};
exports.NullTypes = {
    DbNull: runtime.NullTypes.DbNull,
    JsonNull: runtime.NullTypes.JsonNull,
    AnyNull: runtime.NullTypes.AnyNull,
};
exports.DbNull = runtime.DbNull;
exports.JsonNull = runtime.JsonNull;
exports.AnyNull = runtime.AnyNull;
exports.ModelName = {
    User: 'User',
    Role: 'Role',
    Permission: 'Permission',
    UserRole: 'UserRole',
    RolePermission: 'RolePermission',
    Trip: 'Trip',
    TripMember: 'TripMember',
    Category: 'Category',
    Expense: 'Expense',
    ExpenseSplit: 'ExpenseSplit',
    Budget: 'Budget',
    Itinerary: 'Itinerary',
    Notification: 'Notification',
    Device: 'Device',
    Celebrate: 'Celebrate',
    CelebrateImage: 'CelebrateImage'
};
exports.TransactionIsolationLevel = runtime.makeStrictEnum({
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
});
exports.UserScalarFieldEnum = {
    id: 'id',
    email: 'email',
    fullName: 'fullName',
    password: 'password',
    dateOfBirth: 'dateOfBirth',
    gender: 'gender',
    status: 'status',
    isVerified: 'isVerified',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    googleId: 'googleId',
    avatar: 'avatar'
};
exports.RoleScalarFieldEnum = {
    id: 'id',
    name: 'name',
    description: 'description'
};
exports.PermissionScalarFieldEnum = {
    id: 'id',
    name: 'name',
    description: 'description'
};
exports.UserRoleScalarFieldEnum = {
    userId: 'userId',
    roleId: 'roleId'
};
exports.RolePermissionScalarFieldEnum = {
    roleId: 'roleId',
    permissionId: 'permissionId'
};
exports.TripScalarFieldEnum = {
    id: 'id',
    name: 'name',
    startDate: 'startDate',
    endDate: 'endDate',
    totalBudget: 'totalBudget',
    status: 'status',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    images: 'images'
};
exports.TripMemberScalarFieldEnum = {
    id: 'id',
    tripId: 'tripId',
    userId: 'userId',
    role: 'role',
    inviteStatus: 'inviteStatus',
    joinedAt: 'joinedAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    leftAt: 'leftAt'
};
exports.CategoryScalarFieldEnum = {
    id: 'id',
    name: 'name',
    icon: 'icon',
    color: 'color',
    isDefault: 'isDefault',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.ExpenseScalarFieldEnum = {
    id: 'id',
    tripId: 'tripId',
    amount: 'amount',
    currency: 'currency',
    categoryId: 'categoryId',
    description: 'description',
    paidById: 'paidById',
    type: 'type',
    date: 'date',
    receipt: 'receipt',
    isConfirmed: 'isConfirmed',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.ExpenseSplitScalarFieldEnum = {
    id: 'id',
    expenseId: 'expenseId',
    userId: 'userId',
    amount: 'amount',
    percentage: 'percentage',
    splitType: 'splitType',
    isPaid: 'isPaid',
    paidAt: 'paidAt',
    confirmed: 'confirmed',
    confirmedAt: 'confirmedAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.BudgetScalarFieldEnum = {
    id: 'id',
    userId: 'userId',
    amount: 'amount',
    month: 'month',
    year: 'year',
    warningAt: 'warningAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.ItineraryScalarFieldEnum = {
    id: 'id',
    tripId: 'tripId',
    date: 'date',
    title: 'title',
    description: 'description',
    activities: 'activities',
    photos: 'photos',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.NotificationScalarFieldEnum = {
    id: 'id',
    userId: 'userId',
    type: 'type',
    title: 'title',
    message: 'message',
    refId: 'refId',
    senderId: 'senderId',
    data: 'data',
    isRead: 'isRead',
    readAt: 'readAt',
    createdAt: 'createdAt'
};
exports.DeviceScalarFieldEnum = {
    id: 'id',
    deviceId: 'deviceId',
    fcmToken: 'fcmToken',
    userId: 'userId',
    platform: 'platform',
    locale: 'locale',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.CelebrateScalarFieldEnum = {
    id: 'id',
    tripId: 'tripId',
    userId: 'userId',
    description: 'description',
    date: 'date',
    createdAt: 'createdAt'
};
exports.CelebrateImageScalarFieldEnum = {
    id: 'id',
    celebrateId: 'celebrateId',
    imageUrl: 'imageUrl',
    createdAt: 'createdAt'
};
exports.SortOrder = {
    asc: 'asc',
    desc: 'desc'
};
exports.NullableJsonNullValueInput = {
    DbNull: exports.DbNull,
    JsonNull: exports.JsonNull
};
exports.NullsOrder = {
    first: 'first',
    last: 'last'
};
exports.UserOrderByRelevanceFieldEnum = {
    id: 'id',
    email: 'email',
    fullName: 'fullName',
    password: 'password',
    googleId: 'googleId',
    avatar: 'avatar'
};
exports.RoleOrderByRelevanceFieldEnum = {
    name: 'name',
    description: 'description'
};
exports.PermissionOrderByRelevanceFieldEnum = {
    name: 'name',
    description: 'description'
};
exports.UserRoleOrderByRelevanceFieldEnum = {
    userId: 'userId'
};
exports.TripOrderByRelevanceFieldEnum = {
    id: 'id',
    name: 'name',
    images: 'images'
};
exports.TripMemberOrderByRelevanceFieldEnum = {
    id: 'id',
    tripId: 'tripId',
    userId: 'userId'
};
exports.CategoryOrderByRelevanceFieldEnum = {
    id: 'id',
    name: 'name',
    icon: 'icon',
    color: 'color'
};
exports.ExpenseOrderByRelevanceFieldEnum = {
    id: 'id',
    tripId: 'tripId',
    currency: 'currency',
    categoryId: 'categoryId',
    description: 'description',
    paidById: 'paidById',
    receipt: 'receipt'
};
exports.ExpenseSplitOrderByRelevanceFieldEnum = {
    id: 'id',
    expenseId: 'expenseId',
    userId: 'userId'
};
exports.BudgetOrderByRelevanceFieldEnum = {
    id: 'id',
    userId: 'userId'
};
exports.JsonNullValueFilter = {
    DbNull: exports.DbNull,
    JsonNull: exports.JsonNull,
    AnyNull: exports.AnyNull
};
exports.QueryMode = {
    default: 'default',
    insensitive: 'insensitive'
};
exports.ItineraryOrderByRelevanceFieldEnum = {
    id: 'id',
    tripId: 'tripId',
    title: 'title',
    description: 'description'
};
exports.NotificationOrderByRelevanceFieldEnum = {
    id: 'id',
    userId: 'userId',
    title: 'title',
    message: 'message',
    refId: 'refId',
    senderId: 'senderId'
};
exports.DeviceOrderByRelevanceFieldEnum = {
    deviceId: 'deviceId',
    fcmToken: 'fcmToken',
    userId: 'userId',
    platform: 'platform',
    locale: 'locale'
};
exports.CelebrateOrderByRelevanceFieldEnum = {
    id: 'id',
    tripId: 'tripId',
    userId: 'userId',
    description: 'description'
};
exports.CelebrateImageOrderByRelevanceFieldEnum = {
    id: 'id',
    celebrateId: 'celebrateId',
    imageUrl: 'imageUrl'
};
exports.defineExtension = runtime.Extensions.defineExtension;
//# sourceMappingURL=prismaNamespace.js.map