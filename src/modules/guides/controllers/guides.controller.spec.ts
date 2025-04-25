import { Test, TestingModule } from '@nestjs/testing';
import { GuidesController } from './guides.controller';
import { GuidesService } from '../services/guides.service';
import { CreateGuideDto, UpdateGuideDto } from '../schemas/guides.schema';
import { FilesDto, FileDto } from '@/modules/files/schemas/files.schema';
import { PageDto, PageOptionsDto } from '@/common';
import { Guides } from '../entities/guides.entity';

jest.mock('../services/guides.service');


describe('GuidesController', () => {
  let controller: GuidesController;
  let service: jest.Mocked<GuidesService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GuidesController],
      providers: [
        {
          provide: GuidesService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            findAllApp: jest.fn(),
            total: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<GuidesController>(GuidesController);
    service = module.get(GuidesService);
  });

  describe('create', () => {
    it('should create a new guide', async () => {
      const dto: CreateGuideDto = { name: 'New Guide', description: 'Description', categoryId:1, file: 'file-content', fileSecondary: 'file-content', fileTertiary: 'file-content' };
      const files: FilesDto = { file: 'file-content', fileSecondary: 'file-content', fileTertiary: 'file-content' };
      service.create.mockResolvedValue(new Guides());

      expect(await controller.create(files, dto)).toEqual(new Guides());
      expect(service.create).toHaveBeenCalledWith(dto, files);
    });
  });

  describe('findAll', () => {
    it('should return all guides paginated', async () => {
      const result = { data: [], meta: { page: 1, take: 10, total: 0, pageCount: 0, hasPreviousPage: false, hasNextPage: false } };
      const pageOptionsDto: PageOptionsDto = { page: 1, take: 10, skip: 0 };
      service.findAll.mockResolvedValue(result);

      expect(await controller.findAll(pageOptionsDto)).toEqual(result);
      expect(service.findAll).toHaveBeenCalledWith(pageOptionsDto);
    });
  });

  describe('findOne', () => {
    it('should return a single guide', async () => {
      const result = new Guides();
      service.findOne.mockResolvedValue(result);

      expect(await controller.findOne(1)).toEqual(result);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update a guide', async () => {
      const dto: UpdateGuideDto = { name: 'Updated Guide' };
      const file: FileDto = { file: 'file-content' };
      service.update.mockResolvedValue('Guide updated successfully');

      expect(await controller.update(1, file, dto)).toEqual('Guide updated successfully');
      expect(service.update).toHaveBeenCalledWith(1, dto, file);
    });
  });

  describe('remove', () => {
    it('should remove a guide', async () => {
      service.remove.mockResolvedValue('Guide removed successfully');

      expect(await controller.remove(1)).toEqual('Guide removed successfully');
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('findAllApp', () => {
    it('should return all guides for the app paginated', async () => {
      const result = { data: [], meta: { page: 1, take: 10, total: 0, pageCount: 0, hasPreviousPage: false, hasNextPage: false } };
      const pageOptionsDto: PageOptionsDto = { page: 1, take: 10, skip: 0 };
      service.findAllApp.mockResolvedValue(result);

      expect(await controller.findAllApp(pageOptionsDto)).toEqual(result);
      expect(service.findAllApp).toHaveBeenCalledWith(pageOptionsDto);
    });
  });

  describe('total', () => {
    it('should return the total number of guides', async () => {
      service.total.mockResolvedValue(100);

      expect(await controller.total()).toEqual(100);
      expect(service.total).toHaveBeenCalled();
    });
  });
});
