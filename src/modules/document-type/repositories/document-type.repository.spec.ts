import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { DocumentTypeRepository } from './document-type.repository';
import { DocumentType } from '../entities/document-type.entity';
import { PageDto, PageMetaDto, PageOptionsDto } from '@/common';
import { UpdateDocumentDto } from '../schemas/document-type.schema';
import { throwCustomError } from '@/common/utils/Error';
import { Category } from '@/modules/category/entities/category.entity';

jest.mock('@/common/utils/Error');

describe('DocumentTypeRepository', () => {
  let repository: DocumentTypeRepository;
  let documentTypeRepoMock: jest.Mocked<Repository<DocumentType>>;
  let dataSourceMock: jest.Mocked<DataSource>;
  let queryRunnerMock: jest.Mocked<QueryRunner>;

  beforeEach(async () => {
    documentTypeRepoMock = {
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

    repository = new DocumentTypeRepository(documentTypeRepoMock, dataSourceMock);
  });

  describe('save', () => {
    it('should save a document type', async () => {
      const documentType = new DocumentType();
      documentTypeRepoMock.save.mockResolvedValue(documentType);

      const result = await repository.save(documentType);
      expect(result).toBe(documentType);
      expect(documentTypeRepoMock.save).toHaveBeenCalledWith(documentType);
    });
  });

  describe('findOne', () => {
    it('should find a document type by id', async () => {
      const documentType = new DocumentType();
      documentTypeRepoMock.findOne.mockResolvedValue(documentType);

      const result = await repository.findOne({ id: 1 });
      expect(result).toBe(documentType);
      expect(documentTypeRepoMock.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('findAll', () => {
    it('should return a paginated list of document types', async () => {
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
      const updateDocumentDto: UpdateDocumentDto = { typeName: 'Updated Name' };
      const documentType = new DocumentType();
      documentType.id = 1;
      documentType.typeName = 'Old Name';
  
      queryRunnerMock.manager.findOne = jest.fn()
        .mockResolvedValueOnce(documentType)
        .mockResolvedValueOnce(null);
  
      queryRunnerMock.manager.save = jest.fn().mockResolvedValue(documentType);
  
      const result = await repository.update(1, updateDocumentDto);
  
      expect(result).toBe('Tipo de documento actualizado correctamente');
      expect(queryRunnerMock.startTransaction).toHaveBeenCalled();
      expect(queryRunnerMock.commitTransaction).toHaveBeenCalled();
      expect(queryRunnerMock.release).toHaveBeenCalled();
    });
  
    it('should throw an error if category is not found', async () => {
      queryRunnerMock.manager.findOne = jest.fn().mockResolvedValue(null);
  
      await expect(repository.update(1, { typeName: 'Updated Name' }))
        .rejects.toThrowError('document_not_found');
    });
  
    it('should throw an error if category already exists with the same name', async () => {
      const documentType = new DocumentType();
      documentType.id = 2;
  
      queryRunnerMock.manager.findOne = jest.fn()
        .mockResolvedValueOnce(new DocumentType())
        .mockResolvedValueOnce(documentType);
  
      await expect(repository.update(1, { typeName: 'Updated Name' }))
        .rejects.toThrowError('document_exists');
    });
  });

  describe('remove', () => {
    it('should remove a document type', async () => {
      documentTypeRepoMock.findOne.mockResolvedValue(new DocumentType());
      documentTypeRepoMock.delete.mockResolvedValue({ affected: 1, raw: [] });

      const result = await repository.remove(1);
      expect(result).toEqual({ affected: 1, raw: [] });
    });
  });
});
