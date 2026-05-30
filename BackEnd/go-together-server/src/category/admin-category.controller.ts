import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { CategoryService } from "./category.service";

@ApiTags("Admin Categories")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("admin/categories")
export class AdminCategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  getCategories() {
    return this.categoryService.getAdminCategories();
  }

  @Post()
  createCategory(@Body() body: any) {
    return this.categoryService.createAdminCategory(body);
  }

  @Put(":id")
  updateCategory(@Param("id") id: string, @Body() body: any) {
    return this.categoryService.updateAdminCategory(id, body);
  }

  @Delete(":id")
  deleteCategory(@Param("id") id: string) {
    return this.categoryService.deleteAdminCategory(id);
  }
}
