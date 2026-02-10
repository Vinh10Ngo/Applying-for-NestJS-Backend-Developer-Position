import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { NotFoundException } from "@nestjs/common";
import { ArticlesService } from "./articles.service";
import { Article } from "./schemas/article.schema";

describe("ArticlesService", () => {
  let service: ArticlesService;
  let mockArticleModel: any;

  beforeEach(async () => {
    mockArticleModel = {
      find: jest.fn().mockReturnThis(),
      findById: jest.fn().mockReturnThis(),
      findByIdAndDelete: jest.fn(),
      countDocuments: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(0) }),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
      save: jest.fn(),
      constructor: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticlesService,
        {
          provide: getModelToken(Article.name),
          useValue: mockArticleModel,
        },
      ],
    }).compile();

    service = module.get<ArticlesService>(ArticlesService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findAll", () => {
    it("should return paginated result with items and total", async () => {
      mockArticleModel.exec.mockResolvedValueOnce([]).mockResolvedValueOnce(0);

      const result = await service.findAll(1, 10, false);

      expect(result).toHaveProperty("items");
      expect(result).toHaveProperty("total", 0);
      expect(result).toHaveProperty("page", 1);
      expect(result).toHaveProperty("limit", 10);
      expect(result).toHaveProperty("totalPages");
      expect(mockArticleModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ deletedAt: null }),
      );
    });

    it("should filter by published when publishedOnly is true", async () => {
      mockArticleModel.exec.mockResolvedValueOnce([]).mockResolvedValueOnce(0);

      await service.findAll(1, 10, true);

      expect(mockArticleModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ deletedAt: null, published: true }),
      );
    });

    it("should add search regex when search is provided", async () => {
      mockArticleModel.exec.mockResolvedValueOnce([]).mockResolvedValueOnce(0);

      await service.findAll(1, 10, false, "nest");

      expect(mockArticleModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          deletedAt: null,
          $or: expect.arrayContaining([
            expect.objectContaining({ title: expect.any(RegExp) }),
            expect.objectContaining({ content: expect.any(RegExp) }),
          ]),
        }),
      );
    });
  });

  describe("findOne", () => {
    it("should throw NotFoundException when article not found", async () => {
      mockArticleModel.exec.mockResolvedValue(null);

      await expect(service.findOne("507f1f77bcf86cd799439011")).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
