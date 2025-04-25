import { Test, TestingModule } from '@nestjs/testing';
import { GuidesRepository } from './guides.repository';
import { Repository, DataSource } from 'typeorm';
import { Guides } from '../entities/guides.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PageOptionsDto, PageDto } from '@/common';

jest.mock('@/common/utils/Error');

describe('GuidesRepository', () => {
  let repository: GuidesRepository;
  let guidesRepositoryMock: jest.Mocked<Repository<Guides>>;
  let dataSourceMock: jest.Mocked<DataSource>;

  beforeEach(async () => {
    guidesRepositoryMock = {
      save: jest.fn(),
      findOne: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0), // Corrected Mock
        getMany: jest.fn().mockResolvedValue([]), // Corrected Mock
      }),
      delete: jest.fn(),
    } as unknown as jest.Mocked<Repository<Guides>>;

    dataSourceMock = {} as unknown as jest.Mocked<DataSource>;

    repository = new GuidesRepository(guidesRepositoryMock, dataSourceMock);
  });

  describe('save', () => {
    it('should save a guide', async () => {
      const guide = new Guides();
      guidesRepositoryMock.save.mockResolvedValue(guide);

      const result = await repository.save(guide);

      expect(result).toEqual(guide);
      expect(guidesRepositoryMock.save).toHaveBeenCalledWith(guide);
    });
  });

  describe('findOne', () => {
    it('should find a guide by ID', async () => {
      const guide = new Guides();
      guidesRepositoryMock.findOne.mockResolvedValue(guide);

      const result = await repository.findOne({ id: 1 });

      expect(result).toEqual(guide);
      expect(guidesRepositoryMock.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('total', () => {
    it('should return the total number of guides', async () => {
      guidesRepositoryMock.count.mockResolvedValue(100);

      const result = await repository.total();

      expect(result).toBe(100);
      expect(guidesRepositoryMock.count).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a guide by ID', async () => {
      guidesRepositoryMock.findOne.mockResolvedValue(new Guides());
      guidesRepositoryMock.delete.mockResolvedValue({ affected: 1, raw: [] });

      const result = await repository.delete(1);

      expect(result).toEqual({ affected: 1, raw: [] });
      expect(guidesRepositoryMock.delete).toHaveBeenCalledWith(1);
    });

    it('should throw an error if guide not found', async () => {
      guidesRepositoryMock.findOne.mockResolvedValue(null);

      await expect(repository.delete(1)).rejects.toThrowError('Guía no encontrada');
      expect(guidesRepositoryMock.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('findAll', () => {
    it('should return paginated guides', async () => {
      const pageOptionsDto: PageOptionsDto = { page: 1, take: 10, skip: 0 };
      const result = new PageDto([], { total: 0, page: 1, take: 10, pageCount: 0, hasPreviousPage: false, hasNextPage: false });

      guidesRepositoryMock.createQueryBuilder = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
        getMany: jest.fn().mockResolvedValue([]),
      });

      const response = await repository.findAll(pageOptionsDto);

      expect(response).toEqual(result);
      expect(guidesRepositoryMock.createQueryBuilder).toHaveBeenCalled();
    });
  });

  describe('findAllApp', () => {
    it('should return paginated guides for the app', async () => {
      const pageOptionsDto: PageOptionsDto = { page: 1, take: 10, skip: 0 };
      const result = new PageDto([], { total: 0, page: 1, take: 10, pageCount: 0, hasPreviousPage: false, hasNextPage: false });

      guidesRepositoryMock.createQueryBuilder = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
        getMany: jest.fn().mockResolvedValue([]),
      });

      const response = await repository.findAllApp(pageOptionsDto);

      expect(response).toEqual(result);
      expect(guidesRepositoryMock.createQueryBuilder).toHaveBeenCalled();
    });
  });
});
