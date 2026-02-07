import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Article, ArticleDocument } from './schemas/article.schema';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectModel(Article.name) private articleModel: Model<ArticleDocument>,
  ) {}

  async create(authorId: string, dto: CreateArticleDto): Promise<ArticleDocument> {
    const article = new this.articleModel({
      ...dto,
      authorId: new Types.ObjectId(authorId),
    });
    return article.save();
  }

  async findAll(
    page = 1,
    limit = 10,
    publishedOnly = false,
    search?: string,
    includeDeleted = false,
  ) {
    const skip = (page - 1) * limit;
    const filter: Record<string, unknown> = {};
    if (!includeDeleted) filter.deletedAt = null;
    if (publishedOnly) filter.published = true;
    if (search?.trim()) {
      const regex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ title: regex }, { content: regex }];
    }
    const [items, total] = await Promise.all([
      this.articleModel
        .find(filter)
        .populate('authorId', 'email fullName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.articleModel.countDocuments(filter).exec(),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findByAuthor(authorId: string, includeDeleted = false) {
    const filter: Record<string, unknown> = { authorId: new Types.ObjectId(authorId) };
    if (!includeDeleted) filter.deletedAt = null;
    const items = await this.articleModel
      .find(filter)
      .populate('authorId', 'email fullName')
      .sort({ createdAt: -1 })
      .exec();
    return { items, total: items.length };
  }

  async findOne(id: string, includeDeleted = false): Promise<ArticleDocument> {
    const article = await this.articleModel
      .findById(id)
      .populate('authorId', 'email fullName')
      .exec();
    if (!article) throw new NotFoundException('Bài viết không tồn tại');
    if (article.deletedAt && !includeDeleted) throw new NotFoundException('Bài viết không tồn tại');
    return article;
  }

  async update(id: string, userId: string, role: string, dto: UpdateArticleDto): Promise<ArticleDocument> {
    const article = await this.articleModel.findById(id).exec();
    if (!article) throw new NotFoundException('Bài viết không tồn tại');
    const isAdmin = role === 'admin';
    if (!isAdmin && article.authorId.toString() !== userId) {
      throw new ForbiddenException('Bạn không có quyền sửa bài viết này');
    }
    Object.assign(article, dto);
    return article.save();
  }

  async remove(id: string, userId: string, role: string): Promise<ArticleDocument> {
    const article = await this.articleModel.findById(id).exec();
    if (!article) throw new NotFoundException('Bài viết không tồn tại');
    if (article.deletedAt) throw new NotFoundException('Bài viết đã bị xóa trước đó');
    const isAdmin = role === 'admin';
    if (!isAdmin && article.authorId.toString() !== userId) {
      throw new ForbiddenException('Bạn không có quyền xóa bài viết này');
    }
    article.deletedAt = new Date();
    return article.save();
  }

  async restore(id: string, userId: string, role: string): Promise<ArticleDocument> {
    const article = await this.articleModel.findById(id).exec();
    if (!article) throw new NotFoundException('Bài viết không tồn tại');
    if (!article.deletedAt) throw new NotFoundException('Bài viết không ở trạng thái đã xóa');
    const isAdmin = role === 'admin';
    if (!isAdmin && article.authorId.toString() !== userId) {
      throw new ForbiddenException('Bạn không có quyền khôi phục bài viết này');
    }
    article.deletedAt = null;
    return article.save();
  }
}
