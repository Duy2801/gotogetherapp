import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { AdminService } from "./admin.service";

@ApiTags("Admin")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("admin")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("me")
  getMe(@Req() req: any) {
    return this.adminService.getMe(req.user.userId ?? req.user.sub);
  }

  @Get("dashboard")
  getDashboard(@Query("month") month?: string, @Query("year") year?: string) {
    return this.adminService.getDashboard(month ? Number(month) : undefined, year ? Number(year) : undefined);
  }

  @Get("users")
  getUsers(
    @Query("query") query = "",
    @Query("page") page = "1",
    @Query("limit") limit = "10",
    @Query("status") status = "",
  ) {
    return this.adminService.getUsers(query, Number(page), Number(limit), status);
  }

  @Get("users/:id")
  getUserDetail(@Param("id") id: string) {
    return this.adminService.getUserDetail(id);
  }

  @Patch("users/:id/status")
  updateUserStatus(@Param("id") id: string, @Body("status") status: string) {
    return this.adminService.updateUserStatus(id, status);
  }

  @Get("trips")
  getTrips(
    @Query("status") status = "",
    @Query("page") page = "1",
    @Query("limit") limit = "10",
  ) {
    return this.adminService.getTrips(status, Number(page), Number(limit));
  }

  @Get("trips/:id")
  getTripDetail(@Param("id") id: string) {
    return this.adminService.getTripDetail(id);
  }

  @Get("categories")
  getCategories() {
    return this.adminService.getCategories();
  }

  @Post("categories")
  createCategory(@Body() body: any) {
    return this.adminService.createCategory(body);
  }

  @Put("categories/:id")
  updateCategory(@Param("id") id: string, @Body() body: any) {
    return this.adminService.updateCategory(id, body);
  }

  @Delete("categories/:id")
  deleteCategory(@Param("id") id: string) {
    return this.adminService.deleteCategory(id);
  }

  @Get("destinations")
  getDestinations() {
    return this.adminService.getDestinations();
  }

  @Get("destinations/:id")
  getDestinationDetail(@Param("id") id: string) {
    return this.adminService.getDestinationDetail(id);
  }

  @Get("settings")
  getSettings() {
    return this.adminService.getSettings();
  }

  @Put("settings")
  saveSettings(@Body() body: any) {
    return this.adminService.saveSettings(body);
  }
}