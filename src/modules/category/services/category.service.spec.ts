// category.service.spec.ts
import { HttpException } from "@nestjs/common";
import { CategoryService } from "../services/category.service";
import { CategoryRepository } from "../repositories/category.repository";
import { Category } from "../entities/category.entity";
import {
  CreateCategoryDto,
  UpdateCategoryDto,
} from "../schemas/category.schema";
import { Order, PageDto, PageOptionsDto } from "@/common";

describe("CategoryService", () => {
  let service: CategoryService;
  let repository: Partial<CategoryRepository>;

  beforeEach(() => {
    repository = {
      findOne: jest.fn(),
      save: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    service = new CategoryService(repository as CategoryRepository);
  });

  describe("create", () => {
    const createDto: CreateCategoryDto = { categoryName: "Test Category" };

    it("should throw error if category already exists", async () => {
      (repository.findOne as jest.Mock).mockResolvedValue({
        id: 1,
        categoryName: "Test Category",
      });
      await expect(service.create(createDto)).rejects.toThrow(HttpException);
      await expect(service.create(createDto)).rejects.toThrow(
        "La categoria ya existe",
      );
    });

    it("should throw error if repository.save returns an error", async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(null);
      const error = new Error("save error");
      (repository.save as jest.Mock).mockRejectedValue(error);
      await expect(service.create(createDto)).rejects.toThrow(HttpException);
    });

    it("should create and return the new category", async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(null);
      const newCategory: Category = {
        id: 1,
        categoryName: "Test Category",
      } as Category;
      (repository.save as jest.Mock).mockResolvedValue(newCategory);

      const result = await service.create(createDto);
      expect(result).toEqual(newCategory);
    });
  });

  describe("findAll", () => {
    const pageOptionsDto: any = {
      page: 1,
      take: 10,
      order: Order.ASC,
      search: "",
    };

    it("should return a page of categories", async () => {
      const pageDto: PageDto<Category> = new PageDto(
        [{ id: 1, categoryName: "Test Category" } as Category],
        { total: 1, pageOptionsDto } as any,
      );
      (repository.findAll as jest.Mock).mockResolvedValue(pageDto);

      const result = await service.findAll(pageOptionsDto);
      expect(result).toEqual(pageDto);
    });

    it("should throw error if repository.findAll fails", async () => {
      const error = new Error("findAll error");
      (repository.findAll as jest.Mock).mockRejectedValue(error);
      await expect(service.findAll(pageOptionsDto)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe("findOne", () => {
    it("should return the category if found", async () => {
      const category: Category = {
        id: 1,
        categoryName: "Test Category",
      } as Category;
      (repository.findOne as jest.Mock).mockResolvedValue(category);

      const result = await service.findOne(1);
      expect(result).toEqual(category);
    });

    it("should throw NOT_FOUND error if category not found", async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.findOne(1)).rejects.toThrow(HttpException);
      await expect(service.findOne(1)).rejects.toThrow(
        "Categoria no encontrada",
      );
    });

    it("should throw error if repository.findOne fails", async () => {
      const error = new Error("findOne error");
      (repository.findOne as jest.Mock).mockRejectedValue(error);
      await expect(service.findOne(1)).rejects.toThrow(HttpException);
    });
  });

  describe("update", () => {
    const updateDto: UpdateCategoryDto = { categoryName: "Updated Category" };

    it("should return success message on update", async () => {
      (repository.update as jest.Mock).mockResolvedValue(
        "Categoria actualizada correctamente",
      );
      const result = await service.update(1, updateDto);
      expect(result).toEqual("Categoria actualizada correctamente");
    });

    it("should throw error if repository.update fails", async () => {
      const error = new Error("update error");
      (repository.update as jest.Mock).mockRejectedValue(error);
      await expect(service.update(1, updateDto)).rejects.toThrow(HttpException);
    });
  });

  describe("remove", () => {
    it("should remove the category and return data", async () => {
      const removeResult = { affected: 1 };
      (repository.remove as jest.Mock).mockResolvedValue(removeResult);
      const result = await service.remove(1);
      expect(result).toEqual(removeResult);
    });

    it("should throw error if repository.remove fails", async () => {
      const error = new Error("remove error");
      (repository.remove as jest.Mock).mockRejectedValue(error);
      await expect(service.remove(1)).rejects.toThrow(HttpException);
    });
  });
});
