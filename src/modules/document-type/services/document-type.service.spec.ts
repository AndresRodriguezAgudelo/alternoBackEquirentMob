import { Test, TestingModule } from "@nestjs/testing";
import { DocumentTypeService } from "./document-type.service";
import { DocumentTypeRepository } from "../repositories/document-type.repository";
import {
  CreateDocumentDto,
  UpdateDocumentDto,
} from "../schemas/document-type.schema";
import { HttpException, HttpStatus } from "@nestjs/common";
import { PageDto, PageOptionsDto } from "@/common";
import { DocumentType } from "../entities/document-type.entity";

const mockDocumentTypeRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe("DocumentTypeService", () => {
  let service: DocumentTypeService;
  let repository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentTypeService,
        {
          provide: DocumentTypeRepository,
          useFactory: mockDocumentTypeRepository,
        },
      ],
    }).compile();

    service = module.get<DocumentTypeService>(DocumentTypeService);
    repository = module.get<DocumentTypeRepository>(DocumentTypeRepository);
  });

  describe("create", () => {
    it("should create a document type", async () => {
      const dto: CreateDocumentDto = { typeName: "DNI" };
      repository.findOne.mockResolvedValue(null);
      repository.save.mockResolvedValue({ id: 1, ...dto });

      const result = await service.create(dto);
      expect(result).toEqual({ id: 1, ...dto });
      expect(repository.save).toHaveBeenCalled();
    });

    it("should throw if document type already exists", async () => {
      repository.findOne.mockResolvedValue({ typeName: "DNI" });
      await expect(service.create({ typeName: "DNI" })).rejects.toThrow(
        new HttpException(
          "El tipo de documento ya existe",
          HttpStatus.BAD_REQUEST,
        ),
      );
    });
  });

  describe("findAll", () => {
    it("should return paginated document types", async () => {
      const pageOptions: any = new PageOptionsDto();
      const result = new PageDto<DocumentType>([], pageOptions);
      repository.findAll.mockResolvedValue(result);

      expect(await service.findAll(pageOptions)).toEqual(result);
    });
  });

  describe("findOne", () => {
    it("should return a document type if found", async () => {
      repository.findOne.mockResolvedValue({ id: 1, typeName: "DNI" });
      const result = await service.findOne(1);
      expect(result).toEqual({ id: 1, typeName: "DNI" });
    });

    it("should throw if document type not found", async () => {
      repository.findOne.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(
        new HttpException(
          "Tipo de documento no encontrado",
          HttpStatus.NOT_FOUND,
        ),
      );
    });
  });

  describe("update", () => {
    it("should update document type and return a message", async () => {
      const dto: UpdateDocumentDto = { typeName: "CC" };
      repository.update.mockResolvedValue("Actualizado");
      const result = await service.update(1, dto);
      expect(result).toBe("Actualizado");
    });
  });

  describe("remove", () => {
    it("should remove document type and return a message", async () => {
      repository.remove.mockResolvedValue("Eliminado");
      const result = await service.remove(1);
      expect(result).toBe("Eliminado");
    });
  });
});
