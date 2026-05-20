import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CelebrateService } from "./celebrate.service";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { CreateCelebrateDTO } from "./dto/celebrate.dto";
import { UpdateCelebrateDTO } from "./dto/update-celebrate.dto";
import { CreateCommentDTO } from "./dto/create-comment.dto";
import { ToggleReactionDTO } from "./dto/toggle-reaction.dto";
@ApiTags("Celebrate")
@Controller("celebrate")
export class CelebrateController {
  constructor(private celebrateService: CelebrateService) {}
  @ApiBearerAuth()
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: "Lấy tất cả celebrate của user (kèm thông tin từng chuyến đi)",
  })
  getAllCelebration(@Req() req: any) {
    return this.celebrateService.getAllCelebrate(req.user.userId);
  }

  @ApiBearerAuth()
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: "Tạo kỷ niệm mới",
  })
  createCelebrate(@Req() req: any, @Body() dto: CreateCelebrateDTO) {
    return this.celebrateService.createCelebrate(req.user.userId, dto);
  }

  @ApiBearerAuth()
  @Put(":celebrateId")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: "Cập nhật kỷ niệm",
  })
  updateCelebrate(
    @Req() req: any,
    @Param("celebrateId") celebrateId: string,
    @Body() dto: UpdateCelebrateDTO,
  ) {
    return this.celebrateService.updateCelebrate(
      celebrateId,
      req.user.userId,
      dto,
    );
  }

  @ApiBearerAuth()
  @Get(":celebrateId/comments")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Lấy danh sách bình luận cho kỷ niệm" })
  getComments(@Req() req: any, @Param('celebrateId') celebrateId: string) {
    return this.celebrateService.getComments(celebrateId, req.user?.userId);
  }

  @ApiBearerAuth()
  @Post(":celebrateId/comments")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Tạo bình luận cho kỷ niệm" })
  createComment(@Req() req: any, @Param('celebrateId') celebrateId: string, @Body() dto: CreateCommentDTO) {
    return this.celebrateService.createComment(req.user.userId, celebrateId, dto);
  }

  @ApiBearerAuth()
  @Get(":celebrateId/reactions")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Lấy thông tin reaction cho kỷ niệm" })
  getReactions(@Param('celebrateId') celebrateId: string, @Req() req: any) {
    return this.celebrateService.getReactions(celebrateId, req.user?.userId);
  }

  @ApiBearerAuth()
  @Post(":celebrateId/reactions")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Toggle reaction cho kỷ niệm" })
  toggleReaction(@Req() req: any, @Param('celebrateId') celebrateId: string, @Body() dto: ToggleReactionDTO) {
    return this.celebrateService.toggleReaction(req.user.userId, celebrateId, dto);
  }
}
