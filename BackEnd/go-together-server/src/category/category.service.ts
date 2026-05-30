import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

type CategoryExpenseStat = {
  categoryId: string;
  _sum?: { amount?: unknown };
  _count?: { _all?: number };
};

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async getAdminCategories() {
    const categories = await this.prisma.category.findMany({
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    });
    const categoryIds = categories.map((item: any) => item.id);
    const expenseStats = await this.prisma.expense.groupBy({
      by: ["categoryId"],
      where: { categoryId: { in: categoryIds } },
      _sum: { amount: true },
      _count: { _all: true },
    });
    const statMap = new Map<string, CategoryExpenseStat>(
      expenseStats.map((item: any) => [item.categoryId, item]),
    );

    return categories.map((category: any) => ({
      id: category.id,
      name: category.name,
      icon: category.icon,
      color: category.color,
      isDefault: category.isDefault,
      expenseCount: Number(statMap.get(category.id)?._count?._all ?? 0),
      totalAmount: Number(statMap.get(category.id)?._sum?.amount ?? 0),
    }));
  }

  async createAdminCategory(payload: any) {
    return this.prisma.category.create({
      data: {
        name: payload.name,
        icon: payload.icon ?? null,
        color: payload.color ?? null,
        isDefault: Boolean(payload.isDefault),
      },
    });
  }

  async updateAdminCategory(id: string, payload: any) {
    return this.prisma.category.update({
      where: { id },
      data: {
        name: payload.name,
        icon: payload.icon ?? null,
        color: payload.color ?? null,
        isDefault: payload.isDefault !== undefined ? Boolean(payload.isDefault) : undefined,
      },
    });
  }

  async deleteAdminCategory(id: string) {
    const fallbackCategory = await this.prisma.category.upsert({
      where: { id: "admin-other-category" },
      update: {},
      create: {
        id: "admin-other-category",
        name: "Khác",
        icon: null,
        color: "#00dbe9",
        isDefault: true,
      },
    });

    if (fallbackCategory.id === id) {
      throw new Error("Không thể xóa danh mục mặc định Khác.");
    }

    await this.prisma.expense.updateMany({
      where: { categoryId: id },
      data: { categoryId: fallbackCategory.id },
    });
    await this.prisma.category.delete({ where: { id } });
    return { message: "category.deleted" };
  }
}
