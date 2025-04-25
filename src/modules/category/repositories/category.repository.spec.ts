import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { CategoryRepository } from './category.repository';
import { Category } from '../entities/category.entity';
import { PageDto, PageMetaDto, PageOptionsDto } from '@/common';
import { UpdateCategoryDto } from '../schemas/category.schema';
import { throwCustomError } from '@/common/utils/Error';

jest.mock('@/common/utils/Error');

describe('CategoryRepository', () => {
  let repository: CategoryRepository;
  let categoryRepoMock: jest.Mocked<Repository<Category>>;
  let dataSourceMock: jest.Mocked<DataSource>;
  let queryRunnerMock: jest.Mocked<QueryRunner>;

  beforeEach(async () => {
    categoryRepoMock = {
      save: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
        getMany: jest.fn().mockResolvedValue([]),
      }),
      delete: jest.fn(),
    } as any;

    queryRunnerMock = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        findOne: jest.fn(),
        save: jest.fn(),
      },
    } as any;

    dataSourceMock = {
      createQueryRunner: jest.fn().mockReturnValue(queryRunnerMock),
    } as any;

    repository = new CategoryRepository(categoryRepoMock, dataSourceMock);
  });

  describe('save', () => {
    it('should save a category', async () => {
      const category = new Category();
      categoryRepoMock.save.mockResolvedValue(category);

      const result = await repository.save(category);
      expect(result).toBe(category);
      expect(categoryRepoMock.save).toHaveBeenCalledWith(category);
    });
  });

  describe('findOne', () => {
    it('should find a category by id', async () => {
      const category = new Category();
      categoryRepoMock.findOne.mockResolvedValue(category);

      const result = await repository.findOne({ id: 1 });
      expect(result).toBe(category);
      expect(categoryRepoMock.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('findAll', () => {
    it('should return a paginated list of categories', async () => {
      const pageOptionsDto: PageOptionsDto = { page: 1, take: 10, skip: 0 };
      const result = await repository.findAll(pageOptionsDto);

      expect(result).toBeInstanceOf(PageDto);
    });
  });

  describe('update', () => {
    beforeEach(() => {
      queryRunnerMock.connect.mockResolvedValue(undefined);
      queryRunnerMock.startTransaction.mockResolvedValue(undefined);
      queryRunnerMock.commitTransaction.mockResolvedValue(undefined);
      queryRunnerMock.rollbackTransaction.mockResolvedValue(undefined);
      queryRunnerMock.release.mockResolvedValue(undefined);
  
      (throwCustomError as jest.Mock).mockImplementation((error: string) => {
        throw new Error(error); // Se lanza el error como un string para facilitar las pruebas
      });
    });
  
    it('should update a category', async () => {
      const updateCategoryDto: UpdateCategoryDto = { categoryName: 'Updated Name' };
      const category = new Category();
      category.id = 1;
      category.categoryName = 'Old Name';
  
      queryRunnerMock.manager.findOne = jest.fn()
        .mockResolvedValueOnce(category)
        .mockResolvedValueOnce(null);
  
      queryRunnerMock.manager.save = jest.fn().mockResolvedValue(category);
  
      const result = await repository.update(1, updateCategoryDto);
  
      expect(result).toBe('Categoria actualizada correctamente');
      expect(queryRunnerMock.startTransaction).toHaveBeenCalled();
      expect(queryRunnerMock.commitTransaction).toHaveBeenCalled();
      expect(queryRunnerMock.release).toHaveBeenCalled();
    });
  
    it('should throw an error if category is not found', async () => {
      queryRunnerMock.manager.findOne = jest.fn().mockResolvedValue(null);
  
      await expect(repository.update(1, { categoryName: 'Updated Name' }))
        .rejects.toThrowError('category_not_found');
    });
  
    it('should throw an error if category already exists with the same name', async () => {
      const category = new Category();
      category.id = 2;
  
      queryRunnerMock.manager.findOne = jest.fn()
        .mockResolvedValueOnce(new Category())
        .mockResolvedValueOnce(category);
  
      await expect(repository.update(1, { categoryName: 'Updated Name' }))
        .rejects.toThrowError('category_exists');
    });
  });

  describe('remove', () => {
    it('should remove a category', async () => {
      categoryRepoMock.findOne.mockResolvedValue(new Category());
      categoryRepoMock.delete.mockResolvedValue({ affected: 1, raw: [] });

      const result = await repository.remove(1);
      expect(result).toEqual({ affected: 1, raw: [] });
    });
  });
});
