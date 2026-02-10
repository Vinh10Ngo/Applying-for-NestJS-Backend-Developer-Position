import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { Request } from "express";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { ArticlesService } from "./articles.service";
import { CreateArticleDto } from "./dto/create-article.dto";
import { UpdateArticleDto } from "./dto/update-article.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import {
  CurrentUser,
  CurrentUserPayload,
} from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { Public } from "../common/decorators/public.decorator";
import { CacheInterceptor } from "../common/interceptors/cache.interceptor";
import { AuditService } from "../audit/audit.service";

@ApiTags("Articles")
@ApiBearerAuth("bearer")
@Controller("articles")
export class ArticlesController {
  constructor(
    private readonly articlesService: ArticlesService,
    private readonly auditService: AuditService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @CurrentUser("sub") userId: string,
    @Body() dto: CreateArticleDto,
    @Req() req: Request,
  ) {
    const article = await this.articlesService.create(userId, dto);
    this.auditService
      .log("create", "article", {
        userId,
        resourceId: article._id?.toString(),
        metadata: { title: article.title },
        ip: req.ip,
        userAgent: req.get("user-agent"),
      })
      .catch(() => {});
    return article;
  }

  @Get()
  @Public()
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({
    summary: "Danh sách bài viết (phân trang + tìm kiếm phía server)",
  })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    example: 1,
    description: "Trang (mặc định 1)",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    example: 10,
    description: "Số bài mỗi trang (tối đa 50, mặc định 10)",
  })
  @ApiQuery({
    name: "search_term",
    required: false,
    type: String,
    description: "Tìm trong title và content",
  })
  @ApiQuery({
    name: "search",
    required: false,
    type: String,
    description: "Alias của search_term (tương thích cũ)",
  })
  @ApiQuery({
    name: "published",
    required: false,
    enum: ["true", "false"],
    description: "Chỉ lấy bài đã xuất bản: true | false",
  })
  @ApiQuery({
    name: "includeDeleted",
    required: false,
    enum: ["true", "false"],
    description: "true = bao gồm bài đã xóa mềm",
  })
  @ApiQuery({
    name: "sort",
    required: false,
    enum: ["createdAt", "updatedAt", "title"],
    description: "Sắp xếp theo trường",
  })
  @ApiQuery({
    name: "order",
    required: false,
    enum: ["asc", "desc"],
    description: "Thứ tự asc | desc",
  })
  @ApiQuery({
    name: "authorId",
    required: false,
    type: String,
    description: "Lọc theo author (MongoDB ObjectId)",
  })
  findAll(
    @Query("page") page?: number,
    @Query("limit") limit?: number,
    @Query("search_term") searchTerm?: string,
    @Query("search") search?: string,
    @Query("published") published?: string,
    @Query("includeDeleted") includeDeleted?: string,
    @Query("sort") sort?: string,
    @Query("order") order?: string,
    @Query("authorId") authorId?: string,
  ) {
    const publishedOnly = published === "true";
    const withDeleted = includeDeleted === "true";
    const term = (searchTerm ?? search ?? "").trim();
    const sortBy =
      sort === "updatedAt" || sort === "title" ? sort : "createdAt";
    const orderBy = order === "asc" ? "asc" : "desc";
    return this.articlesService.findAll(
      Number(page) || 1,
      Math.min(Number(limit) || 10, 50),
      publishedOnly,
      term || undefined,
      withDeleted,
      sortBy,
      orderBy,
      authorId || undefined,
    );
  }

  @Get("admin")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiOperation({
    summary: "Quản lý bài viết (Admin): tất cả bài, phân trang + tìm kiếm",
  })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "search_term", required: false, type: String })
  @ApiQuery({ name: "sort", required: false, enum: ["createdAt", "updatedAt", "title"] })
  @ApiQuery({ name: "order", required: false, enum: ["asc", "desc"] })
  @ApiQuery({ name: "authorId", required: false, type: String })
  getAdminList(
    @Query("page") page?: number,
    @Query("limit") limit?: number,
    @Query("search_term") searchTerm?: string,
    @Query("search") search?: string,
    @Query("sort") sort?: string,
    @Query("order") order?: string,
    @Query("authorId") authorId?: string,
  ) {
    const term = (searchTerm ?? search ?? "").trim();
    const sortBy =
      sort === "updatedAt" || sort === "title" ? sort : "createdAt";
    const orderBy = order === "asc" ? "asc" : "desc";
    return this.articlesService.findAll(
      Number(page) || 1,
      Math.min(Number(limit) || 10, 50),
      false,
      term || undefined,
      true,
      sortBy,
      orderBy,
      authorId || undefined,
    );
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Lấy danh sách bài viết của user đăng nhập" })
  getMyArticles(
    @CurrentUser("sub") userId: string,
    @Query("includeDeleted") includeDeleted?: string,
  ) {
    return this.articlesService.findByAuthor(userId, includeDeleted === "true");
  }

  @Get(":id")
  @Public()
  findOne(@Param("id") id: string) {
    return this.articlesService.findOne(id);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard)
  async update(
    @Param("id") id: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: UpdateArticleDto,
    @Req() req: Request,
  ) {
    const article = await this.articlesService.update(
      id,
      user.sub,
      user.role,
      dto,
    );
    this.auditService
      .log("update", "article", {
        userId: user.sub,
        resourceId: id,
        metadata: { title: article.title },
        ip: req.ip,
        userAgent: req.get("user-agent"),
      })
      .catch(() => {});
    return article;
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  async remove(
    @Param("id") id: string,
    @CurrentUser() user: CurrentUserPayload,
    @Req() req: Request,
  ) {
    const article = await this.articlesService.remove(id, user.sub, user.role);
    this.auditService
      .log("soft_delete", "article", {
        userId: user.sub,
        resourceId: id,
        metadata: { title: article.title },
        ip: req.ip,
        userAgent: req.get("user-agent"),
      })
      .catch(() => {});
    return article;
  }

  @Patch(":id/restore")
  @UseGuards(JwtAuthGuard)
  async restore(
    @Param("id") id: string,
    @CurrentUser() user: CurrentUserPayload,
    @Req() req: Request,
  ) {
    const article = await this.articlesService.restore(
      id,
      user.sub,
      user.role,
    );
    this.auditService
      .log("restore", "article", {
        userId: user.sub,
        resourceId: id,
        metadata: { title: article.title },
        ip: req.ip,
        userAgent: req.get("user-agent"),
      })
      .catch(() => {});
    return article;
  }
}
