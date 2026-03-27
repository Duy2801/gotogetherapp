import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { BudgetService } from "./budget.service";
import { CreateBudgetDto } from "./dto/create-budget.dto";
import { UpdateBudgetDto } from "./dto/update-budget.dto";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";

@ApiTags("Budget")
@Controller("budgets")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BudgetController {
  constructor(private budgetService: BudgetService) {}

  @Post()
  @ApiOperation({ summary: "Tạo budget mới cho tháng" })
  async createBudget(
    @Req() req: any,
    @Body() dto: CreateBudgetDto,
  ): Promise<any> {
    return this.budgetService.createBudget(req.user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: "Lấy budget tháng hiện tại" })
  async getBudgetByMonth(
    @Req() req: any,
    @Query("month") month?: string,
    @Query("year") year?: string,
  ): Promise<any> {
    const monthNum = month ? parseInt(month) : undefined;
    const yearNum = year ? parseInt(year) : undefined;
    return this.budgetService.getBudgetByMonth(
      req.user.userId,
      monthNum,
      yearNum,
    );
  }

  @Put(":id")
  @ApiOperation({ summary: "Cập nhật budget" })
  async updateBudget(
    @Req() req: any,
    @Param("id") budgetId: string,
    @Body() dto: UpdateBudgetDto,
  ): Promise<any> {
    return this.budgetService.updateBudget(budgetId, req.user.userId, dto);
  }
}
