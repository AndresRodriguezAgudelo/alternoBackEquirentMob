import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from './category.controller';
import { CategoryService } from '../services/category.service';
import { CreateCategoryDto, UpdateCategoryDto } from '../schemas/category.schema';
import { PageOptionsDto } from '@/common';

describe('CategoryController', () => {
  let controller: CategoryController;
  let service: jest.Mocked<CategoryService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        {
          provide: CategoryService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CategoryController>(CategoryController);
    service = module.get(CategoryService);
  });

  describe('create', () => {
    it('should create a new category', async () => {
      const createCategoryDto: CreateCategoryDto = { categoryName: 'New Category' };
      const result = { id: 1, ...createCategoryDto, guides: [] };

      service.create.mockResolvedValue(result);

      expect(await controller['create'](createCategoryDto)).toEqual(result);
      expect(service.create).toHaveBeenCalledWith(createCategoryDto);
    });
  });

  describe('findAll', () => {
    it('should return all categories', async () => {
      const pageOptionsDto: PageOptionsDto = { page: 1, take: 10, skip: 0 };
      const result = { data: [], meta: { page: 1, take: 10, total: 0, pageCount: 0, hasPreviousPage: false, hasNextPage: false } };

      service.findAll.mockResolvedValue(result);

      expect(await controller['findAll'](pageOptionsDto)).toEqual(result);
      expect(service.findAll).toHaveBeenCalledWith(pageOptionsDto);
    });
  });

  describe('findOne', () => {
    it('should return a category by id', async () => {
      const id = 1;
      const result = { id, categoryName: 'Test Category', guides: [] };

      service.findOne.mockResolvedValue(result);

      expect(await controller['findOne'](id)).toEqual(result);
      expect(service.findOne).toHaveBeenCalledWith(id);
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const id = 1;
      const updateCategoryDto: UpdateCategoryDto = { categoryName: 'Updated Category' };
      const result = 'Categoría actualizada correctamente';

      service.update.mockResolvedValue(result);

      expect(await controller['update'](id, updateCategoryDto)).toEqual(result);
      expect(service.update).toHaveBeenCalledWith(id, updateCategoryDto);
    });
  });

  describe('remove', () => {
    it('should delete a category by id', async () => {
      const id = 1;
      const result = { success: true };

      service.remove.mockResolvedValue(result);

      expect(await controller['remove'](id)).toEqual(result);
      expect(service.remove).toHaveBeenCalledWith(id);
    });
  });
});
