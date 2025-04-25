import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, Repository } from 'typeorm';
import { CityRepository } from './city.repository';
import { City } from '../entities/city.entity';
import { PageDto, PageOptionsDto } from '@/common';
import { throwCustomError } from '@/common/utils/Error';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UpdateCityDto } from '../schemas/city.schema';
import { HttpException } from '@nestjs/common'; 

jest.mock('@/common/utils/Error', () => ({
  throwCustomError: jest.fn().mockImplementation((errorCode: string) => {
    throw new HttpException(errorCode, 400);
  }),
}));

describe('CityRepository', () => {
  let repository: CityRepository;
  let cityRepo: Repository<City>;
  let dataSource: DataSource;
  let queryRunner: any;

  beforeEach(async () => {
    queryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        findOne: jest.fn(),
        save: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CityRepository,
        {
          provide: getRepositoryToken(City),
          useClass: Repository,
        },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn().mockReturnValue(queryRunner),
          },
        },
      ],
    }).compile();

    repository = module.get<CityRepository>(CityRepository);
    cityRepo = module.get<Repository<City>>(getRepositoryToken(City));
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('save', () => {
    it('should save a city successfully', async () => {
      const city = new City();
      jest.spyOn(cityRepo, 'save').mockResolvedValue(city);

      const result = await repository.save(city);

      expect(result).toBe(city);
      expect(cityRepo.save).toHaveBeenCalledWith(city);
    });
  });

  describe('findOne', () => {
    it('should find a city successfully', async () => {
      const city = new City();
      jest.spyOn(cityRepo, 'findOne').mockResolvedValue(city);

      const result = await repository.findOne({ id: 1 });

      expect(result).toBe(city);
      expect(cityRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should return null if city is not found', async () => {
      jest.spyOn(cityRepo, 'findOne').mockResolvedValue(null);

      const result = await repository.findOne({ id: 1 });

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return paginated cities', async () => {
      const cities = [new City(), new City()];
      const pageOptionsDto = new PageOptionsDto();
      pageOptionsDto.page = 1;
      pageOptionsDto.take = 10;

      jest.spyOn(cityRepo, 'createQueryBuilder').mockReturnValue({
        select: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(2),
        getMany: jest.fn().mockResolvedValue(cities),
      } as any);

      const result = await repository.findAll(pageOptionsDto);

      expect(result).toBeInstanceOf(PageDto);
      expect(result.data).toEqual(cities);
    });
  });

  describe('remove', () => {
    it('should remove a city successfully', async () => {
      const city = new City();
      jest.spyOn(repository, 'findOne').mockResolvedValue(city);
      jest.spyOn(cityRepo, 'delete').mockResolvedValue({ affected: 1 } as any);

      const result = await repository.remove(1);

      expect(result).toEqual({ affected: 1 });
      expect(cityRepo.delete).toHaveBeenCalledWith(1);
    });

    it('should throw an error if city is not found on remove', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      try {
        await repository.remove(1);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe('city_not_found');
      }
    });
  });

  describe('update', () => {
    it('should update a city successfully', async () => {
      const city = new City();
      city.cityName = 'New York';

      queryRunner.manager.findOne.mockResolvedValue(city);

      const updateCityDto: UpdateCityDto = { cityName: 'Los Angeles' };

      const result = await repository.update(1, updateCityDto);

      expect(queryRunner.manager.save).toHaveBeenCalledWith(city);
      expect(result).toBe('Ciudad actualizada correctamente');
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('should throw an error if city not found', async () => {
      queryRunner.manager.findOne.mockResolvedValue(null);

      try {
        await repository.update(1, { cityName: 'Los Angeles' });
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe('city_not_found');
        expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      }
    });

    it('should throw an error if city name already exists', async () => {
      const city = new City();
      const existingCity = new City();
      existingCity.id = 2;

      queryRunner.manager.findOne
        .mockResolvedValueOnce(city)
        .mockResolvedValueOnce(existingCity);

      try {
        await repository.update(1, { cityName: 'Los Angeles' });
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe('city_exists');
        expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      }
    });

    it('should throw a generic error if an error occurs during the transaction', async () => {
      queryRunner.manager.findOne.mockImplementation(() => {
        throw new Error('Unexpected Error');
      });

      try {
        await repository.update(1, { cityName: 'New York' });
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe('city_error');
        expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      }
    });
  });
});
