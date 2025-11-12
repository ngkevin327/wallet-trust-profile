import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { JwtPayload } from "../auth/jwt.service";
import { CreateExportDto } from "./dto/create-export.dto";
import { ExportsService } from "./exports.service";

@ApiTags("exports")
@Controller("me/exports")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ExportsController {
  constructor(private readonly exports: ExportsService) {}

  @Post()
  @ApiOperation({ summary: "Create JSON or PDF export snapshot" })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateExportDto) {
    return this.exports.createExport(user.sub, dto.format);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get export job status" })
  getStatus(@CurrentUser() user: JwtPayload, @Param("id") id: string) {
    return this.exports.getExportForUser(user.sub, id);
  }

  @Get(":id/download")
  @ApiOperation({ summary: "Download export JSON payload" })
  download(@CurrentUser() user: JwtPayload, @Param("id") id: string) {
    return this.exports.getDownloadPayload(user.sub, id);
  }
}
