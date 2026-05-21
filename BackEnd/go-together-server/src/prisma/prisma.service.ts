import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "prisma/generated/client";
import { ConfigService } from "@nestjs/config";
import { PrismaPg } from "@prisma/adapter-pg";
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  declare readonly user: any;
  declare readonly role: any;
  declare readonly permission: any;
  declare readonly userRole: any;
  declare readonly rolePermission: any;
  declare readonly trip: any;
  declare readonly tripMember: any;
  declare readonly category: any;
  declare readonly expense: any;
  declare readonly expenseSplit: any;
  declare readonly budget: any;
  declare readonly itinerary: any;
  declare readonly notification: any;
  declare readonly device: any;
  declare readonly celebrate: any;
  declare readonly celebrateImage: any;
  declare readonly celebrateComment: any;
  declare readonly celebrateReaction: any;

  constructor(private configService: ConfigService) {
    const adapter = new PrismaPg({
      connectionString: configService.get<string>("DATABASE_URL"),
    });
    super({
      adapter,
    });
  }
  async onModuleInit() {
    await this.$connect();
  }
}
