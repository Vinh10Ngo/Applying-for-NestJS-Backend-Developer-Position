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
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser, CurrentUserPayload } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Articles')
@ApiBearerAuth('bearer')
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateArticleDto,
  ) {
    return this.articlesService.create(userId, dto);
  }

  @Get()
  @Public()
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Trang (mặc định 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Số bài mỗi trang (tối đa 50, mặc định 10)' })
  @ApiQuery({ name: 'published', required: false, enum: ['true', 'false'], description: 'Chỉ lấy bài đã xuất bản: true | false' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Tìm trong title và content (không dấu)' })
  @ApiQuery({ name: 'includeDeleted', required: false, enum: ['true', 'false'], description: 'true = bao gồm bài đã xóa mềm' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('published') published?: string,
    @Query('search') search?: string,
    @Query('includeDeleted') includeDeleted?: string,
  ) {
    const publishedOnly = published === 'true';
    const withDeleted = includeDeleted === 'true';
    return this.articlesService.findAll(
      Number(page) || 1,
      Math.min(Number(limit) || 10, 50),
      publishedOnly,
      search,
      withDeleted,
    );
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lấy danh sách bài viết của user đăng nhập' })
  getMyArticles(
    @CurrentUser('sub') userId: string,
    @Query('includeDeleted') includeDeleted?: string,
  ) {
    return this.articlesService.findByAuthor(userId, includeDeleted === 'true');
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.articlesService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: UpdateArticleDto,
  ) {
    return this.articlesService.update(id, user.sub, user.role, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.articlesService.remove(id, user.sub, user.role);
  }

  @Patch(':id/restore')
  @UseGuards(JwtAuthGuard)
  restore(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.articlesService.restore(id, user.sub, user.role);
  }
}
