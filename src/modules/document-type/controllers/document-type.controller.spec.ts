import { Test, TestingModule } from '@nestjs/testing';
import { DocumentTypeController } from './document-type.controller';
import { DocumentTypeService } from '../services/document-type.service';
import { CreateDocumentDto, UpdateDocumentDto } from '../schemas/document-type.schema';
import { PageOptionsDto } from '@/common';

describe('DocumentTypeController', () => {
  let controller: DocumentTypeController;
  let service: jest.Mocked<DocumentTypeService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentTypeController],
      providers: [
        {
          provide: DocumentTypeService,
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

    controller = module.get<DocumentTypeController>(DocumentTypeController);
    service = module.get(DocumentTypeService);
  });

  describe('create', () => {
    it('should create a new document type', async () => {
      const createDocumentDto: CreateDocumentDto = { typeName: 'New Document' };
      const result = { id: 1, ...createDocumentDto };

      service.create.mockResolvedValue(result);

      expect(await controller['create'](createDocumentDto)).toEqual(result);
      expect(service.create).toHaveBeenCalledWith(createDocumentDto);
    });
  });

  describe('findAll', () => {
    it('should return all document types', async () => {
      const pageOptionsDto: PageOptionsDto = { page: 1, take: 10, skip: 0 };
      const result = { data: [], meta: { page: 1, take: 10, total: 0, pageCount: 0, hasPreviousPage: false, hasNextPage: false } };

      service.findAll.mockResolvedValue(result);

      expect(await controller['findAll'](pageOptionsDto)).toEqual(result);
      expect(service.findAll).toHaveBeenCalledWith(pageOptionsDto);
    });
  });

  describe('findOne', () => {
    it('should return a document type by id', async () => {
      const id = 1;
      const result = { id, typeName: 'Test Document' };

      service.findOne.mockResolvedValue(result);

      expect(await controller['findOne'](id)).toEqual(result);
      expect(service.findOne).toHaveBeenCalledWith(id);
    });
  });

  describe('update', () => {
    it('should update a document type', async () => {
      const id = 1;
      const updateDocumentDto: UpdateDocumentDto = { typeName: 'Updated Document' };
      const result = 'Documento actualizado correctamente';

      service.update.mockResolvedValue(result);

      expect(await controller['update'](id, updateDocumentDto)).toEqual(result);
      expect(service.update).toHaveBeenCalledWith(id, updateDocumentDto);
    });
  });

  describe('remove', () => {
    it('should delete a document type by id', async () => {
      const id = 1;
      const result = { success: true };

      service.remove.mockResolvedValue(result);

      expect(await controller['remove'](id)).toEqual(result);
      expect(service.remove).toHaveBeenCalledWith(id);
    });
  });
});
