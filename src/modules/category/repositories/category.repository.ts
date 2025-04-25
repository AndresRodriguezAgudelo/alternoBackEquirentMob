import { DataSource, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Injectable } from "@nestjs/common";
import { PageDto, PageMetaDto, PageOptionsDto } from "@/common";
import { throwCustomError } from "@/common/utils/Error";
import { Category } from "../entities/category.entity";
import { ICategory } from "@/interfaces/category.interface";
import { UpdateCategoryDto } from "../schemas/category.schema";

@Injectable()
export class CategoryRepository {
  constructor(
    @InjectRepository(Category)
    private readonly repository: Repository<Category>,
    private readonly dataSource: DataSource,
  ) {}

  public async save(Category: Category): Promise<Category> {
    return this.repository.save(Category);
  }

  public async findOne(data: ICategory): Promise<Category> {
    const Category = await this.repository.findOne({
      where: { ...data },
    });
    return Category;
  }

  public async findAll(
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Category>> {
    const queryBuilder = this.repository.createQueryBuilder("category");
    queryBuilder
      .select(["category.id", "category.categoryName"])
      .orderBy("category.categoryName", pageOptionsDto.order)
      .skip((pageOptionsDto.page - 1) * pageOptionsDto.take)
      .take(pageOptionsDto.take);

    if (pageOptionsDto.search) {
      queryBuilder.andWhere(
        "LOWER(category.categoryName) LIKE LOWER(:search)",
        { search: `%${pageOptionsDto.search}%` },
      );
    }

    const total = await queryBuilder.getCount();
    const products = await queryBuilder.getMany();

    const pageMetaDto = new PageMetaDto({ total, pageOptionsDto });

    return new PageDto(products, pageMetaDto);
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<string> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();

    let transactionStarted = false;

    try {
      await queryRunner.startTransaction();
      transactionStarted = true;

      const category = await queryRunner.manager.findOne(Category, {
        where: { id },
      });

      if (!category) {
        throwCustomError("category_not_found");
      }

      const existingCategory = await queryRunner.manager.findOne(Category, {
        where: { categoryName: updateCategoryDto.categoryName },
      });

      if (existingCategory && existingCategory.id !== id) {
        throwCustomError("category_exists");
      }

      category.categoryName = updateCategoryDto.categoryName;

      await queryRunner.manager.save(category);
      await queryRunner.commitTransaction();

      return "Categoria actualizada correctamente";
    } catch (error) {
      if (transactionStarted) {
        await queryRunner.rollbackTransaction();
      }
      if (typeof error === 'string') {
        throw new Error(error);
      } else {
        throw error;
      }
    } finally {
      if (transactionStarted) {
        await queryRunner.release();
      }
    }
  }

  public async remove(id: number): Promise<any> {
    const Category = await this.findOne({ id });

    if (!Category) {
      throwCustomError("category_not_found");
    }
    return await this.repository.delete(id);
  }
}
