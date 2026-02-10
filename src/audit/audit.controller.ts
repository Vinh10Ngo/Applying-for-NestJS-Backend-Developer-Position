import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { AuditService } from "./audit.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";

@ApiTags("Audit")
@ApiBearerAuth("bearer")
@Controller("audit")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin")
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: "Xem log hoạt động (admin)" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "userId", required: false, type: String })
  @ApiQuery({ name: "resource", required: false, type: String })
  @ApiQuery({ name: "action", required: false, type: String })
  findAll(
    @Query("page") page?: number,
    @Query("limit") limit?: number,
    @Query("userId") userId?: string,
    @Query("resource") resource?: string,
    @Query("action") action?: string,
  ) {
    return this.auditService.findRecent(
      Number(page) || 1,
      Math.min(Number(limit) || 20, 100),
      { userId, resource, action },
    );
  }
}
