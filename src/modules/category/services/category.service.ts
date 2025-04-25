import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { CategoryRepository } from "../repositories/category.repository";
import {
  CreateCategoryDto,
  UpdateCategoryDto,
} from "../schemas/category.schema";
import { Category } from "../entities/category.entity";
import to from "await-to-js";
import { PageDto, PageOptionsDto } from "@/common";

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async create(body: CreateCategoryDto): Promise<Category> {
    try {
      const existingcategory = await this.categoryRepository.findOne({
        categoryName: body.categoryName,
      });
      if (existingcategory) {
        throw new HttpException(
          "La categoria ya existe",
          HttpStatus.BAD_REQUEST,
        );
      }
      const category = new Category();
      category.categoryName = body.categoryName;

      const [error, newcategory] = await to(
        this.categoryRepository.save(category),
      );
      if (error) throw new HttpException(error, HttpStatus.BAD_REQUEST);
      return newcategory;
    } catch (error) {
      if (!(error instanceof HttpException)) {
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
      }
      throw error;
    }
  }

  async findAll(pageOptionsDto: PageOptionsDto): Promise<PageDto<Category>> {
    try {
      const [error, data] = await to(
        this.categoryRepository.findAll(pageOptionsDto),
      );
      if (error) throw new HttpException(error, HttpStatus.BAD_REQUEST);
      return data;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async findOne(id: number) {
    try {
      const category = await this.categoryRepository.findOne({ id });
      if (!category) {
        throw new HttpException(
          "Categoria no encontrada",
          HttpStatus.NOT_FOUND,
        );
      }
      return category;
    } catch (error) {
      if (!(error instanceof HttpException)) {
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
      }
      throw error;
    }
  }

  async update(id: number, dto: UpdateCategoryDto): Promise<string> {
    try {
      const [error, data] = await to(this.categoryRepository.update(id, dto));
      if (error) throw new HttpException(error, HttpStatus.BAD_REQUEST);
      return data;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async remove(id: number) {
    try {
      const [error, data] = await to(this.categoryRepository.remove(id));
      if (error) throw new HttpException(error, HttpStatus.BAD_REQUEST);
      return data;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
