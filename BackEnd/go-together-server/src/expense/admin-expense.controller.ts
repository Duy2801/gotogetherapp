import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { ExpenseService } from "./expense.service";

@ApiTags("Admin Expenses")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("admin/expenses")
export class AdminExpenseController {
  constructor(private readonly expenseService: ExpenseService) { }

  @Get()
  getExpenses(
    @Query("query") query = "",
    @Query("tripId") tripId = "",
    @Query("categoryId") categoryId = "",
    @Query("page") page = "1",
    @Query("limit") limit = "10",
  ) {
    return this.expenseService.getAdminExpenses(query, tripId, categoryId, Number(page), Number(limit));
  }

  @Post()
  createExpense(@Body() body: any) {
    return this.expenseService.createAdminExpense(body);
  }

  @Put(":id")
  updateExpense(@Param("id") id: string, @Body() body: any) {
    return this.expenseService.updateAdminExpense(id, body);
  }

  @Delete(":id")
  deleteExpense(@Param("id") id: string) {
    return this.expenseService.deleteAdminExpense(id);
  }
}
