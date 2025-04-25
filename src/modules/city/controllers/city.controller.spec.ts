import { Test, TestingModule } from '@nestjs/testing';
import { CityController } from './city.controller';
import { CityService } from '../services/city.service';
import { CreateCityDto, UpdateCityDto } from '../schemas/city.schema';
import { PageOptionsDto } from '@/common';


describe('CityController', () => {
  let controller: CityController;
  let service: jest.Mocked<CityService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CityController],
      providers: [
        {
          provide: CityService,
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

    controller = module.get<CityController>(CityController);
    service = module.get(CityService);
  });

  describe('create', () => {
    it('should create a new city', async () => {
      const createCityDto: CreateCityDto = { cityName: 'New City' };
      const result = { id: 1, ...createCityDto, users: [], vehicles: [] };

      service.create.mockResolvedValue(result);

      expect(await controller['create'](createCityDto)).toBe(result);
      expect(service.create).toHaveBeenCalledWith(createCityDto);
    });
  });

  describe('findAll', () => {
    it('should return all cities', async () => {
      const pageOptionsDto: PageOptionsDto = { page: 1, take: 10, skip: 0 };
      const result = { data: [], meta: { page: 1, take: 10, total: 0, pageCount: 0, hasPreviousPage: false, hasNextPage: false } };

      service.findAll.mockResolvedValue(result);

      expect(await controller['findAll'](pageOptionsDto)).toBe(result);
      expect(service.findAll).toHaveBeenCalledWith(pageOptionsDto);
    });
  });

  describe('findOne', () => {
    it('should return a single city by id', async () => {
      const id = 1;
      const result = { id, cityName: 'Test City', users: [], vehicles: [] };

      service.findOne.mockResolvedValue(result);

      expect(await controller['findOne'](id)).toBe(result);
      expect(service.findOne).toHaveBeenCalledWith(id);
    });
  });

  describe('update', () => {
    it('should update a city', async () => {
      const id = 1;
      const updateCityDto: UpdateCityDto = { cityName: 'Updated City' };
      const result = 'Ciudad actualizada correctamente';
  
      service.update.mockResolvedValue(result);
  
      expect(await controller['update'](id, updateCityDto)).toBe(result);
      expect(service.update).toHaveBeenCalledWith(id, updateCityDto);
    });
  });

  describe('remove', () => {
    it('should delete a city by id', async () => {
      const id = 1;
      const result = { success: true };

      service.remove.mockResolvedValue(result);

      expect(await controller['remove'](id)).toBe(result);
      expect(service.remove).toHaveBeenCalledWith(id);
    });
  });
});