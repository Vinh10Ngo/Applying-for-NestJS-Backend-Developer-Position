import { Controller, Post, Body, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { Public } from "../common/decorators/public.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuditService } from "../audit/audit.service";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly auditService: AuditService,
  ) {}

  @Public()
  @Post("register")
  register(@Body() dto: CreateUserDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post("login")
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const result = await this.authService.login(dto);
    this.auditService
      .log("login", "auth", {
        userId: result.user.id,
        metadata: { email: result.user.email },
        ip: req.ip,
        userAgent: req.get("user-agent"),
      })
      .catch(() => {});
    return result;
  }

  @Public()
  @Post("refresh")
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refresh_token);
  }

  @Public()
  @Post("logout")
  logout(@Body() dto: RefreshTokenDto) {
    return this.authService.logout(dto.refresh_token);
  }

  @Post("change-password")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("bearer")
  changePassword(
    @CurrentUser("sub") userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      userId,
      dto.currentPassword,
      dto.newPassword,
    );
  }
}
