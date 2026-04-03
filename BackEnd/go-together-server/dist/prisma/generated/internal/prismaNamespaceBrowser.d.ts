import * as runtime from "@prisma/client/runtime/index-browser";
export type * from '../models.js';
export type * from './prismaNamespace.js';
export declare const Decimal: typeof runtime.Decimal;
export declare const NullTypes: {
    DbNull: (new (secret: never) => typeof runtime.DbNull);
    JsonNull: (new (secret: never) => typeof runtime.JsonNull);
    AnyNull: (new (secret: never) => typeof runtime.AnyNull);
};
export declare const DbNull: import("@prisma/client-runtime-utils").DbNullClass;
export declare const JsonNull: import("@prisma/client-runtime-utils").JsonNullClass;
export declare const AnyNull: import("@prisma/client-runtime-utils").AnyNullClass;
export declare const ModelName: {
    readonly User: "User";
    readonly Role: "Role";
    readonly Permission: "Permission";
    readonly UserRole: "UserRole";
    readonly RolePermission: "RolePermission";
    readonly Trip: "Trip";
    readonly TripMember: "TripMember";
    readonly Category: "Category";
    readonly Expense: "Expense";
    readonly ExpenseSplit: "ExpenseSplit";
    readonly Budget: "Budget";
    readonly Itinerary: "Itinerary";
    readonly Notification: "Notification";
    readonly Device: "Device";
    readonly Celebrate: "Celebrate";
    readonly CelebrateImage: "CelebrateImage";
};
export type ModelName = (typeof ModelName)[keyof typeof ModelName];
export declare const TransactionIsolationLevel: {
    readonly ReadUncommitted: "ReadUncommitted";
    readonly ReadCommitted: "ReadCommitted";
    readonly RepeatableRead: "RepeatableRead";
    readonly Serializable: "Serializable";
};
export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel];
export declare const UserScalarFieldEnum: {
    readonly id: "id";
    readonly email: "email";
    readonly fullName: "fullName";
    readonly password: "password";
    readonly dateOfBirth: "dateOfBirth";
    readonly gender: "gender";
    readonly status: "status";
    readonly isVerified: "isVerified";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
    readonly googleId: "googleId";
    readonly avatar: "avatar";
};
export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum];
export declare const RoleScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly description: "description";
};
export type RoleScalarFieldEnum = (typeof RoleScalarFieldEnum)[keyof typeof RoleScalarFieldEnum];
export declare const PermissionScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly description: "description";
};
export type PermissionScalarFieldEnum = (typeof PermissionScalarFieldEnum)[keyof typeof PermissionScalarFieldEnum];
export declare const UserRoleScalarFieldEnum: {
    readonly userId: "userId";
    readonly roleId: "roleId";
};
export type UserRoleScalarFieldEnum = (typeof UserRoleScalarFieldEnum)[keyof typeof UserRoleScalarFieldEnum];
export declare const RolePermissionScalarFieldEnum: {
    readonly roleId: "roleId";
    readonly permissionId: "permissionId";
};
export type RolePermissionScalarFieldEnum = (typeof RolePermissionScalarFieldEnum)[keyof typeof RolePermissionScalarFieldEnum];
export declare const TripScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly startDate: "startDate";
    readonly endDate: "endDate";
    readonly totalBudget: "totalBudget";
    readonly status: "status";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
    readonly images: "images";
};
export type TripScalarFieldEnum = (typeof TripScalarFieldEnum)[keyof typeof TripScalarFieldEnum];
export declare const TripMemberScalarFieldEnum: {
    readonly id: "id";
    readonly tripId: "tripId";
    readonly userId: "userId";
    readonly role: "role";
    readonly inviteStatus: "inviteStatus";
    readonly joinedAt: "joinedAt";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
    readonly leftAt: "leftAt";
};
export type TripMemberScalarFieldEnum = (typeof TripMemberScalarFieldEnum)[keyof typeof TripMemberScalarFieldEnum];
export declare const CategoryScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly icon: "icon";
    readonly color: "color";
    readonly isDefault: "isDefault";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type CategoryScalarFieldEnum = (typeof CategoryScalarFieldEnum)[keyof typeof CategoryScalarFieldEnum];
export declare const ExpenseScalarFieldEnum: {
    readonly id: "id";
    readonly tripId: "tripId";
    readonly amount: "amount";
    readonly currency: "currency";
    readonly categoryId: "categoryId";
    readonly description: "description";
    readonly paidById: "paidById";
    readonly type: "type";
    readonly date: "date";
    readonly receipt: "receipt";
    readonly isConfirmed: "isConfirmed";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type ExpenseScalarFieldEnum = (typeof ExpenseScalarFieldEnum)[keyof typeof ExpenseScalarFieldEnum];
export declare const ExpenseSplitScalarFieldEnum: {
    readonly id: "id";
    readonly expenseId: "expenseId";
    readonly userId: "userId";
    readonly amount: "amount";
    readonly percentage: "percentage";
    readonly splitType: "splitType";
    readonly isPaid: "isPaid";
    readonly paidAt: "paidAt";
    readonly confirmed: "confirmed";
    readonly confirmedAt: "confirmedAt";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type ExpenseSplitScalarFieldEnum = (typeof ExpenseSplitScalarFieldEnum)[keyof typeof ExpenseSplitScalarFieldEnum];
export declare const BudgetScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly amount: "amount";
    readonly month: "month";
    readonly year: "year";
    readonly warningAt: "warningAt";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type BudgetScalarFieldEnum = (typeof BudgetScalarFieldEnum)[keyof typeof BudgetScalarFieldEnum];
export declare const ItineraryScalarFieldEnum: {
    readonly id: "id";
    readonly tripId: "tripId";
    readonly date: "date";
    readonly title: "title";
    readonly description: "description";
    readonly activities: "activities";
    readonly photos: "photos";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type ItineraryScalarFieldEnum = (typeof ItineraryScalarFieldEnum)[keyof typeof ItineraryScalarFieldEnum];
export declare const NotificationScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly type: "type";
    readonly title: "title";
    readonly message: "message";
    readonly refId: "refId";
    readonly senderId: "senderId";
    readonly data: "data";
    readonly isRead: "isRead";
    readonly readAt: "readAt";
    readonly createdAt: "createdAt";
};
export type NotificationScalarFieldEnum = (typeof NotificationScalarFieldEnum)[keyof typeof NotificationScalarFieldEnum];
export declare const DeviceScalarFieldEnum: {
    readonly id: "id";
    readonly deviceId: "deviceId";
    readonly fcmToken: "fcmToken";
    readonly userId: "userId";
    readonly platform: "platform";
    readonly locale: "locale";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type DeviceScalarFieldEnum = (typeof DeviceScalarFieldEnum)[keyof typeof DeviceScalarFieldEnum];
export declare const CelebrateScalarFieldEnum: {
    readonly id: "id";
    readonly tripId: "tripId";
    readonly userId: "userId";
    readonly description: "description";
    readonly date: "date";
    readonly createdAt: "createdAt";
};
export type CelebrateScalarFieldEnum = (typeof CelebrateScalarFieldEnum)[keyof typeof CelebrateScalarFieldEnum];
export declare const CelebrateImageScalarFieldEnum: {
    readonly id: "id";
    readonly celebrateId: "celebrateId";
    readonly imageUrl: "imageUrl";
    readonly createdAt: "createdAt";
};
export type CelebrateImageScalarFieldEnum = (typeof CelebrateImageScalarFieldEnum)[keyof typeof CelebrateImageScalarFieldEnum];
export declare const SortOrder: {
    readonly asc: "asc";
    readonly desc: "desc";
};
export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];
export declare const NullableJsonNullValueInput: {
    readonly DbNull: import("@prisma/client-runtime-utils").DbNullClass;
    readonly JsonNull: import("@prisma/client-runtime-utils").JsonNullClass;
};
export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput];
export declare const NullsOrder: {
    readonly first: "first";
    readonly last: "last";
};
export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder];
export declare const UserOrderByRelevanceFieldEnum: {
    readonly id: "id";
    readonly email: "email";
    readonly fullName: "fullName";
    readonly password: "password";
    readonly googleId: "googleId";
    readonly avatar: "avatar";
};
export type UserOrderByRelevanceFieldEnum = (typeof UserOrderByRelevanceFieldEnum)[keyof typeof UserOrderByRelevanceFieldEnum];
export declare const RoleOrderByRelevanceFieldEnum: {
    readonly name: "name";
    readonly description: "description";
};
export type RoleOrderByRelevanceFieldEnum = (typeof RoleOrderByRelevanceFieldEnum)[keyof typeof RoleOrderByRelevanceFieldEnum];
export declare const PermissionOrderByRelevanceFieldEnum: {
    readonly name: "name";
    readonly description: "description";
};
export type PermissionOrderByRelevanceFieldEnum = (typeof PermissionOrderByRelevanceFieldEnum)[keyof typeof PermissionOrderByRelevanceFieldEnum];
export declare const UserRoleOrderByRelevanceFieldEnum: {
    readonly userId: "userId";
};
export type UserRoleOrderByRelevanceFieldEnum = (typeof UserRoleOrderByRelevanceFieldEnum)[keyof typeof UserRoleOrderByRelevanceFieldEnum];
export declare const TripOrderByRelevanceFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly images: "images";
};
export type TripOrderByRelevanceFieldEnum = (typeof TripOrderByRelevanceFieldEnum)[keyof typeof TripOrderByRelevanceFieldEnum];
export declare const TripMemberOrderByRelevanceFieldEnum: {
    readonly id: "id";
    readonly tripId: "tripId";
    readonly userId: "userId";
};
export type TripMemberOrderByRelevanceFieldEnum = (typeof TripMemberOrderByRelevanceFieldEnum)[keyof typeof TripMemberOrderByRelevanceFieldEnum];
export declare const CategoryOrderByRelevanceFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly icon: "icon";
    readonly color: "color";
};
export type CategoryOrderByRelevanceFieldEnum = (typeof CategoryOrderByRelevanceFieldEnum)[keyof typeof CategoryOrderByRelevanceFieldEnum];
export declare const ExpenseOrderByRelevanceFieldEnum: {
    readonly id: "id";
    readonly tripId: "tripId";
    readonly currency: "currency";
    readonly categoryId: "categoryId";
    readonly description: "description";
    readonly paidById: "paidById";
    readonly receipt: "receipt";
};
export type ExpenseOrderByRelevanceFieldEnum = (typeof ExpenseOrderByRelevanceFieldEnum)[keyof typeof ExpenseOrderByRelevanceFieldEnum];
export declare const ExpenseSplitOrderByRelevanceFieldEnum: {
    readonly id: "id";
    readonly expenseId: "expenseId";
    readonly userId: "userId";
};
export type ExpenseSplitOrderByRelevanceFieldEnum = (typeof ExpenseSplitOrderByRelevanceFieldEnum)[keyof typeof ExpenseSplitOrderByRelevanceFieldEnum];
export declare const BudgetOrderByRelevanceFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
};
export type BudgetOrderByRelevanceFieldEnum = (typeof BudgetOrderByRelevanceFieldEnum)[keyof typeof BudgetOrderByRelevanceFieldEnum];
export declare const JsonNullValueFilter: {
    readonly DbNull: import("@prisma/client-runtime-utils").DbNullClass;
    readonly JsonNull: import("@prisma/client-runtime-utils").JsonNullClass;
    readonly AnyNull: import("@prisma/client-runtime-utils").AnyNullClass;
};
export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter];
export declare const QueryMode: {
    readonly default: "default";
    readonly insensitive: "insensitive";
};
export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode];
export declare const ItineraryOrderByRelevanceFieldEnum: {
    readonly id: "id";
    readonly tripId: "tripId";
    readonly title: "title";
    readonly description: "description";
};
export type ItineraryOrderByRelevanceFieldEnum = (typeof ItineraryOrderByRelevanceFieldEnum)[keyof typeof ItineraryOrderByRelevanceFieldEnum];
export declare const NotificationOrderByRelevanceFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly title: "title";
    readonly message: "message";
    readonly refId: "refId";
    readonly senderId: "senderId";
};
export type NotificationOrderByRelevanceFieldEnum = (typeof NotificationOrderByRelevanceFieldEnum)[keyof typeof NotificationOrderByRelevanceFieldEnum];
export declare const DeviceOrderByRelevanceFieldEnum: {
    readonly deviceId: "deviceId";
    readonly fcmToken: "fcmToken";
    readonly userId: "userId";
    readonly platform: "platform";
    readonly locale: "locale";
};
export type DeviceOrderByRelevanceFieldEnum = (typeof DeviceOrderByRelevanceFieldEnum)[keyof typeof DeviceOrderByRelevanceFieldEnum];
export declare const CelebrateOrderByRelevanceFieldEnum: {
    readonly id: "id";
    readonly tripId: "tripId";
    readonly userId: "userId";
    readonly description: "description";
};
export type CelebrateOrderByRelevanceFieldEnum = (typeof CelebrateOrderByRelevanceFieldEnum)[keyof typeof CelebrateOrderByRelevanceFieldEnum];
export declare const CelebrateImageOrderByRelevanceFieldEnum: {
    readonly id: "id";
    readonly celebrateId: "celebrateId";
    readonly imageUrl: "imageUrl";
};
export type CelebrateImageOrderByRelevanceFieldEnum = (typeof CelebrateImageOrderByRelevanceFieldEnum)[keyof typeof CelebrateImageOrderByRelevanceFieldEnum];
