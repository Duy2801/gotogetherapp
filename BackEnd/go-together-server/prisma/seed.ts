import "dotenv/config";
import { PrismaClient } from "./generated/client";
import * as bcrypt from "bcrypt";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const adapter = new PrismaMariaDb({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  connectionLimit: 5,
});
// @ts-ignore
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting seed...");

  // Clear existing data (in reverse order of dependencies)
  await prisma.$transaction([
    prisma.device.deleteMany({}),
    prisma.notification.deleteMany({}),
    prisma.celebrate.deleteMany({}),
    prisma.itinerary.deleteMany({}),
    prisma.expenseSplit.deleteMany({}),
    prisma.expense.deleteMany({}),
    prisma.budget.deleteMany({}),
    prisma.tripMember.deleteMany({}),
    prisma.trip.deleteMany({}),
    prisma.category.deleteMany({}),
    prisma.userRole.deleteMany({}),
    prisma.rolePermission.deleteMany({}),
    prisma.user.deleteMany({}),
    prisma.permission.deleteMany({}),
    prisma.role.deleteMany({}),
  ]);

  console.log("✅ Cleared existing data");

  // 1. Create Roles
  const adminRole = await prisma.role.create({
    data: {
      name: "ADMIN",
      description: "Administrator with full access",
    },
  });

  const userRole = await prisma.role.create({
    data: {
      name: "USER",
      description: "Regular user",
    },
  });

  console.log("✅ Created roles");

  const permissions = await Promise.all([
    prisma.permission.create({
      data: { name: "MANAGE_USERS", description: "Can manage users" },
    }),
    prisma.permission.create({
      data: { name: "MANAGE_TRIPS", description: "Can manage all trips" },
    }),
    prisma.permission.create({
      data: { name: "VIEW_ANALYTICS", description: "Can view analytics" },
    }),
  ]);

  console.log("✅ Created permissions");

  // 3. Create Role-Permission relationships
  await Promise.all(
    permissions.map((permission: any) =>
      prisma.rolePermission.create({
        data: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      }),
    ),
  );

  console.log("✅ Created role-permission relationships");

  // 4. Create Users
  const hashedPassword = await bcrypt.hash("password123", 10);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: "admin@gotogether.com",
        fullName: "Admin User",
        password: hashedPassword,
        dateOfBirth: new Date("1990-01-01"),
        gender: 0,
        status: "ACTIVE",
        isVerified: true,
        avatar:
          "https://res.cloudinary.com/dwawpy4lo/image/upload/v1768049609/avatars/Vector_12_eje0u9.png",
      },
    }),
    prisma.user.create({
      data: {
        email: "user1@gotogether.com",
        fullName: "Nguyễn Văn A",
        password: hashedPassword,
        dateOfBirth: new Date("1995-05-15"),
        gender: 0,
        status: "ACTIVE",
        isVerified: true,
        avatar:
          "https://res.cloudinary.com/dwawpy4lo/image/upload/v1768049609/avatars/Vector_12_eje0u9.png",
      },
    }),
    prisma.user.create({
      data: {
        email: "user2@gotogether.com",
        fullName: "Trần Thị B",
        password: hashedPassword,
        dateOfBirth: new Date("1992-08-20"),
        gender: 1,
        status: "ACTIVE",
        isVerified: true,
        avatar:
          "https://res.cloudinary.com/dwawpy4lo/image/upload/v1768049609/avatars/Vector_12_eje0u9.png",
      },
    }),
    prisma.user.create({
      data: {
        email: "user3@gotogether.com",
        fullName: "Lê Văn C",
        password: hashedPassword,
        dateOfBirth: new Date("1998-03-10"),
        gender: 0,
        status: "ACTIVE",
        isVerified: true,
        avatar:
          "https://res.cloudinary.com/dwawpy4lo/image/upload/v1768049609/avatars/Vector_12_eje0u9.png",
      },
    }),
  ]);

  console.log("✅ Created users");

  // 5. Create User-Role relationships
  await prisma.userRole.create({
    data: {
      userId: users[0].id,
      roleId: adminRole.id,
    },
  });

  await Promise.all(
    users.slice(1).map((user: any) =>
      prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: userRole.id,
        },
      }),
    ),
  );

  console.log("✅ Created user-role relationships");

  // 6. Create Categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Accommodation",
        icon: "https://res.cloudinary.com/dvsuhb9cj/image/upload/v1773409586/hotel_2_ttv1vo.png",
        color: "#FF6B6B",
        isDefault: true,
      },
    }),
    prisma.category.create({
      data: {
        name: "Transportation",
        icon: "https://res.cloudinary.com/dvsuhb9cj/image/upload/v1773409587/taxi_2_npq2ub.png",
        color: "#4ECDC4",
        isDefault: true,
      },
    }),
    prisma.category.create({
      data: {
        name: "Food & Drink",
        icon: "https://res.cloudinary.com/dvsuhb9cj/image/upload/v1773409586/fast-food_2_irp7pz.png",
        color: "#FFE66D",
        isDefault: true,
      },
    }),
    prisma.category.create({
      data: {
        name: "Entertainment",
        icon: "https://res.cloudinary.com/dvsuhb9cj/image/upload/v1773409586/game-console_2_b324gx.png",
        color: "#A8E6CF",
        isDefault: true,
      },
    }),
    prisma.category.create({
      data: {
        name: "Shopping",
        icon: "https://res.cloudinary.com/dvsuhb9cj/image/upload/v1773409586/online-shopping_2_aht7m8.png",
        color: "#FFB6C1",
        isDefault: true,
      },
    }),
    prisma.category.create({
      data: {
        name: "Other",
        icon: "https://res.cloudinary.com/dvsuhb9cj/image/upload/v1773409588/more_2_ijykdo.png",
        color: "#C7CEEA",
        isDefault: true,
      },
    }),
  ]);

  console.log("✅ Created categories");

  // 7. Create Devices
  await Promise.all([
    prisma.device.create({
      data: {
        userId: users[1].id,
        deviceId: "device_ios_user1",
        fcmToken: "fcm_token_user1_ios",
        platform: "ios",
      },
    }),
    prisma.device.create({
      data: {
        userId: users[2].id,
        deviceId: "device_android_user2",
        fcmToken: "fcm_token_user2_android",
        platform: "android",
      },
    }),
  ]);
  console.log("✅ Created celebrates");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
