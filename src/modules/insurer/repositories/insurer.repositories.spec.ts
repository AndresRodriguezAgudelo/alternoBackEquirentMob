import { Test, TestingModule } from '@nestjs/testing';
import { InsurerRepository } from './insurer.repository';
import { Repository, DataSource } from 'typeorm';
import { Insurer } from '../entities/insurer.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UpdateInsurerDto } from '../schemas/insurer.schema';
import { PageOptionsDto, PageDto } from '@/common';
import { throwCustomError } from '@/common/utils/Error';

jest.mock('@/common/utils/Error');


describe('InsurerRepository', () => {
  let repository: InsurerRepository;
  let insurerRepositoryMock: jest.Mocked<Repository<Insurer>>;
  let dataSourceMock: jest.Mocked<DataSource>;
  let queryRunnerMock: any;

  beforeEach(async () => {
    insurerRepositoryMock = {
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
    };

    dataSourceMock = {
      createQueryRunner: jest.fn().mockReturnValue(queryRunnerMock),
    } as any;

    repository = new InsurerRepository(insurerRepositoryMock, dataSourceMock);
  });

  describe('save', () => {
    it('should save an insurer', async () => {
      const insurer = new Insurer();
      insurerRepositoryMock.save.mockResolvedValue(insurer);

      const result = await repository.save(insurer);

      expect(result).toEqual(insurer);
      expect(insurerRepositoryMock.save).toHaveBeenCalledWith(insurer);
    });
  });

  describe('findOne', () => {
    it('should find an insurer by ID', async () => {
      const insurer = new Insurer();
      insurerRepositoryMock.findOne.mockResolvedValue(insurer);

      const result = await repository.findOne({ id: 1 });

      expect(result).toEqual(insurer);
      expect(insurerRepositoryMock.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('remove', () => {
    it('should delete an insurer by ID', async () => {
      insurerRepositoryMock.delete.mockResolvedValue({ affected: 1, raw: [] });

      const result = await repository.remove(1);

      expect(result).toEqual({ affected: 1, raw: [] });
      expect(insurerRepositoryMock.delete).toHaveBeenCalledWith(1);
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
  
    it('should update an insurer', async () => {
      const updateInsurerDto: UpdateInsurerDto = { nameInsurer: 'Updated Name' };
      const insurer = new Insurer();
      insurer.id = 1;
      insurer.nameInsurer = 'Old Name';
  
      queryRunnerMock.manager.findOne = jest.fn()
        .mockResolvedValueOnce(insurer)
        .mockResolvedValueOnce(null);
  
      queryRunnerMock.manager.save = jest.fn().mockResolvedValue(insurer);
  
      const result = await repository.update(1, updateInsurerDto);
  
      expect(result).toBe('Aseguradora actualizada correctamente');
      expect(queryRunnerMock.startTransaction).toHaveBeenCalled();
      expect(queryRunnerMock.commitTransaction).toHaveBeenCalled();
      expect(queryRunnerMock.release).toHaveBeenCalled();
    });
  
    it('should throw an error if insurer is not found', async () => {
      queryRunnerMock.manager.findOne = jest.fn().mockResolvedValue(null);
  
      await expect(repository.update(1, { nameInsurer: 'Updated Name' }))
        .rejects.toThrowError('insurer_not_found');
    });
  
    it('should throw an error if insurer already exists with the same name', async () => {
      const insurer = new Insurer();
      insurer.id = 2;
  
      queryRunnerMock.manager.findOne = jest.fn()
        .mockResolvedValueOnce(new Insurer())
        .mockResolvedValueOnce(insurer);
  
      await expect(repository.update(1, { nameInsurer: 'Updated Name' }))
        .rejects.toThrowError('insurer_exists');
    });
  });
});
