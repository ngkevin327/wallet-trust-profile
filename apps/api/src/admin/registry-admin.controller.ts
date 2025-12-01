import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiHeader, ApiOperation, ApiTags } from "@nestjs/swagger";
import { RegistryService } from "../registry/registry.service";
import { auditAdminMutation } from "./admin-audit";
import { AdminAuthGuard, type AdminRequest } from "./admin-auth.guard";
import {
  CreateDaoDto,
  CreateProtocolDto,
  CreateRiskLabelDto,
  UpdateDaoDto,
  UpdateProtocolDto,
  UpdateRiskLabelDto,
} from "./dto/registry-mutation.dto";

@ApiTags("admin")
@Controller("admin/registry")
@UseGuards(AdminAuthGuard)
@ApiHeader({ name: "X-Admin-Api-Key", required: true })
export class RegistryAdminController {
  constructor(private readonly registry: RegistryService) {}

  @Post("protocols")
  @ApiOperation({ summary: "Create protocol registry entry" })
  createProtocol(@Req() req: AdminRequest, @Body() dto: CreateProtocolDto) {
    auditAdminMutation(req.adminActorId!, "create", "protocol", { slug: dto.slug });
    return this.registry.createProtocol(dto);
  }

  @Patch("protocols/:id")
  @ApiOperation({ summary: "Update protocol registry entry" })
  updateProtocol(
    @Req() req: AdminRequest,
    @Param("id") id: string,
    @Body() dto: UpdateProtocolDto,
  ) {
    auditAdminMutation(req.adminActorId!, "update", "protocol", { id });
    return this.registry.updateProtocol(id, dto);
  }

  @Delete("protocols/:id")
  @ApiOperation({ summary: "Deactivate protocol registry entry" })
  deleteProtocol(@Req() req: AdminRequest, @Param("id") id: string) {
    auditAdminMutation(req.adminActorId!, "delete", "protocol", { id });
    return this.registry.deactivateProtocol(id);
  }

  @Post("daos")
  @ApiOperation({ summary: "Create DAO registry entry" })
  createDao(@Req() req: AdminRequest, @Body() dto: CreateDaoDto) {
    auditAdminMutation(req.adminActorId!, "create", "dao", { slug: dto.slug });
    return this.registry.createDao(dto);
  }

  @Patch("daos/:id")
  @ApiOperation({ summary: "Update DAO registry entry" })
  updateDao(@Req() req: AdminRequest, @Param("id") id: string, @Body() dto: UpdateDaoDto) {
    auditAdminMutation(req.adminActorId!, "update", "dao", { id });
    return this.registry.updateDao(id, dto);
  }

  @Delete("daos/:id")
  @ApiOperation({ summary: "Deactivate DAO registry entry" })
  deleteDao(@Req() req: AdminRequest, @Param("id") id: string) {
    auditAdminMutation(req.adminActorId!, "delete", "dao", { id });
    return this.registry.deactivateDao(id);
  }

  @Post("risk-labels")
  @ApiOperation({ summary: "Create risk label registry entry" })
  createRiskLabel(@Req() req: AdminRequest, @Body() dto: CreateRiskLabelDto) {
    auditAdminMutation(req.adminActorId!, "create", "risk_label", { code: dto.code });
    return this.registry.createRiskLabel(dto);
  }

  @Patch("risk-labels/:id")
  @ApiOperation({ summary: "Update risk label registry entry" })
  updateRiskLabel(
    @Req() req: AdminRequest,
    @Param("id") id: string,
    @Body() dto: UpdateRiskLabelDto,
  ) {
    auditAdminMutation(req.adminActorId!, "update", "risk_label", { id });
    return this.registry.updateRiskLabel(id, dto);
  }

  @Delete("risk-labels/:id")
  @ApiOperation({ summary: "Deactivate risk label registry entry" })
  deleteRiskLabel(@Req() req: AdminRequest, @Param("id") id: string) {
    auditAdminMutation(req.adminActorId!, "delete", "risk_label", { id });
    return this.registry.deactivateRiskLabel(id);
  }
}
