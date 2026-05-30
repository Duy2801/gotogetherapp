import { Module } from "@nestjs/common";
import { AdminCategoryController } from "./admin-category.controller";
import { CategoryService } from "./category.service";

@Module({
  controllers: [AdminCategoryController],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoryModule {}
