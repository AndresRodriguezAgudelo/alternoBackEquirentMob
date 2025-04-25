import { Test, TestingModule } from '@nestjs/testing';
import { InsurerController } from './insurer.controller';
import { InsurerService } from '../services/insurer.service';
import { CreateInsurerDto, UpdateInsurerDto } from '../schemas/insurer.schema';
import { PageOptionsDto } from '@/common';

jest.mock('../services/insurer.service');

describe('InsurerController', () => {
  let controller: InsurerController;
  let service: jest.Mocked<InsurerService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InsurerController],
      providers: [
        {
          provide: InsurerService,
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

    controller = module.get<InsurerController>(InsurerController);
    service = module.get(InsurerService);
  });

  describe('create', () => {
    it('should create a new insurer', async () => {
      const dto: CreateInsurerDto = { nameInsurer: 'New Insurer' };
      service.create.mockResolvedValue({ id: 1, nameInsurer: 'New Insurer' });

      expect(await controller['create'](dto)).toEqual({ id: 1, nameInsurer: 'New Insurer' });
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return all insurers paginated', async () => {
      const result = { data: [], meta: { hasPreviousPage: false, hasNextPage: false, page: 1, take: 10, total: 0, pageCount: 0 } };
      const pageOptionsDto: PageOptionsDto = { page: 1, take: 10, skip: 0,  };
      service.findAll.mockResolvedValue(result);

      expect(await controller['findAll'](pageOptionsDto)).toEqual(result);
      expect(service.findAll).toHaveBeenCalledWith(pageOptionsDto);
    });
  });

  describe('findOne', () => {
    it('should return a single insurer', async () => {
      const result = { id: 1, nameInsurer: 'Insurer 1' };
      service.findOne.mockResolvedValue(result);

      expect(await controller['findOne'](1)).toEqual(result);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update an insurer', async () => {
      const dto: UpdateInsurerDto = { nameInsurer: 'Updated Insurer' };
      service.update.mockResolvedValue('Insurer updated successfully');

      expect(await controller['update'](1, dto)).toBe('Insurer updated successfully');
      expect(service.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('remove', () => {
    it('should remove an insurer', async () => {
      service.remove.mockResolvedValue('Insurer removed successfully');

      expect(await controller['remove'](1)).toBe('Insurer removed successfully');
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
