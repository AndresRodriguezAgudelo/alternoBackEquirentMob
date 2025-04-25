// guides.service.spec.ts

import { Test, TestingModule } from "@nestjs/testing";
import { GuidesService } from "./guides.service";
import { FilesService } from "@/modules/files/services/files.service";
import { GuidesRepository } from "../repositories/guides.repository";
import { HttpException, HttpStatus } from "@nestjs/common";
import { CreateGuideDto, UpdateGuideDto } from "../schemas/guides.schema";
import { PageOptionsDto, PageDto } from "@/common";

const mockGuidesRepository = () => ({
  save: jest.fn(),
  findAll: jest.fn(),
  findAllApp: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
  total: jest.fn(),
});

const mockFilesService = () => ({
  uploadFile: jest.fn(),
});

describe("GuidesService", () => {
  let service: GuidesService;
  let guidesRepo;
  let filesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GuidesService,
        { provide: GuidesRepository, useFactory: mockGuidesRepository },
        { provide: FilesService, useFactory: mockFilesService },
      ],
    }).compile();

    service = module.get<GuidesService>(GuidesService);
    guidesRepo = module.get<GuidesRepository>(GuidesRepository);
    filesService = module.get<FilesService>(FilesService);
  });

  describe("create", () => {
    it("should throw if no main file is provided", async () => {
      const dto: any = {
        name: "GuideName",
        description: "A guide description",
        categoryId: 1,
      };
      const files = {};

      await expect(service.create(dto, files)).rejects.toThrow(
        new HttpException("Imagen principal requerida", HttpStatus.BAD_REQUEST),
      );
    });

    it("should create guide with main file only", async () => {
      // Mock data
      const dto: any = {
        name: "GuideName",
        description: "Description",
        categoryId: 1,
      };
      const files = {
        file: [
          { buffer: Buffer.from("main"), mimetype: "image/jpeg", size: 1024 },
        ],
      };

      // Mocks
      filesService.uploadFile.mockResolvedValue("mainFileKey");
      guidesRepo.save.mockResolvedValue({
        id: 1,
        ...dto,
        keyMain: "mainFileKey",
      });

      const result = await service.create(dto, files);
      expect(result.id).toBe(1);
      expect(result.keyMain).toBe("mainFileKey");
      expect(guidesRepo.save).toHaveBeenCalled();
    });

    it("should handle optional secondary and tertiary files", async () => {
      // Setup
      const dto: any = {
        name: "MultipleFiles",
        description: "Desc",
        categoryId: 2,
      };
      const files = {
        file: [
          { buffer: Buffer.from("main"), mimetype: "image/jpeg", size: 1024 },
        ],
        fileSecondary: [
          {
            buffer: Buffer.from("secondary"),
            mimetype: "image/jpeg",
            size: 2048,
          },
        ],
        fileTertiary: [
          {
            buffer: Buffer.from("tertiary"),
            mimetype: "video/mp4",
            size: 4096,
          },
        ],
      };

      filesService.uploadFile
        .mockResolvedValueOnce("mainKey")
        .mockResolvedValueOnce("secondaryKey")
        .mockResolvedValueOnce("tertiaryKey");

      guidesRepo.save.mockResolvedValue({
        id: 2,
        ...dto,
        keyMain: "mainKey",
        keySecondary: "secondaryKey",
        keyTertiaryVideo: "tertiaryKey",
      });

      const result = await service.create(dto, files);

      expect(result.keyMain).toBe("mainKey");
      expect(result.keySecondary).toBe("secondaryKey");
      expect(result.keyTertiaryVideo).toBe("tertiaryKey");
      expect(filesService.uploadFile).toHaveBeenCalledTimes(3);
    });

    it("should throw if fileService fails", async () => {
      const dto: any = {
        name: "FailingGuide",
        description: "Desc",
        categoryId: 3,
      };
      const files = {
        file: [
          { buffer: Buffer.from("main"), mimetype: "image/jpeg", size: 1024 },
        ],
      };
      filesService.uploadFile.mockRejectedValue(new Error("Upload error"));

      await expect(service.create(dto, files)).rejects.toThrow(HttpException);
    });
  });

  describe("findAll", () => {
    it("should return paged guides", async () => {
      const pageOptions: any = new PageOptionsDto();
      const pageResult = new PageDto<any>([], pageOptions);

      guidesRepo.findAll.mockResolvedValue(pageResult);
      const result = await service.findAll(pageOptions);

      expect(result).toBe(pageResult);
      expect(guidesRepo.findAll).toHaveBeenCalledWith(pageOptions);
    });

    it("should throw on error", async () => {
      const pageOptions = new PageOptionsDto();
      guidesRepo.findAll.mockRejectedValue(new Error("DB error"));

      await expect(service.findAll(pageOptions)).rejects.toThrow(HttpException);
    });
  });

  describe("findAllApp", () => {
    it("should return formatted data", async () => {
      const pageOptions = new PageOptionsDto();
      const data = {
        data: [
          {
            id: 1,
            name: "Guide1",
            keyMain: "mainKey1",
            keySecondary: "secKey1",
            keyTertiaryVideo: "vidKey1",
            description: "desc1",
            categoryId: 1,
            category: { categoryName: "Cat1" },
          },
          {
            id: 2,
            name: "Guide2",
            keyMain: "mainKey2",
            keySecondary: "secKey2",
            keyTertiaryVideo: "vidKey2",
            description: "desc2",
            categoryId: 2,
            category: { categoryName: "Cat2" },
          },
        ],
        meta: { totalItems: 2 },
      };
      guidesRepo.findAllApp.mockResolvedValue(data);

      const result = await service.findAllApp(pageOptions);
      expect(result.categories).toHaveLength(2);
      expect(result.categories[0].categoryName).toBe("Cat1");
      expect(result.categories[1].items[0].name).toBe("Guide2");
    });

    it("should throw on error", async () => {
      const pageOptions = new PageOptionsDto();
      guidesRepo.findAllApp.mockRejectedValue(new Error("DB error"));
      await expect(service.findAllApp(pageOptions)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe("findOne", () => {
    it("should return guide if found", async () => {
      guidesRepo.findOne.mockResolvedValue({ id: 1, name: "Guide1" });
      const result = await service.findOne(1);
      expect(result.id).toBe(1);
    });

    it("should throw if not found", async () => {
      guidesRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(HttpException);
    });
  });

  describe("update", () => {
    it("should throw if guide not found", async () => {
      guidesRepo.findOne.mockResolvedValue(null);
      await expect(
        service.update(999, {
          name: "NewName",
        }),
      ).rejects.toThrow(HttpException);
    });

    it("should update guide successfully", async () => {
      guidesRepo.findOne.mockResolvedValue({
        id: 1,
        name: "OldName",
        keyMain: "oldKey",
        keySecondary: "",
        keyTertiaryVideo: "",
      });

      guidesRepo.save.mockResolvedValue(true);
      filesService.uploadFile.mockResolvedValue("newMainKey");

      const result = await service.update(
        1,
        { name: "NewName" },
        {
          file: [
            {
              buffer: Buffer.from("newmain"),
              mimetype: "image/jpeg",
              size: 2048,
            },
          ],
        },
      );
      expect(result).toBe("Guía actualizada correctamente");
    });

    it("should handle repository save error", async () => {
      guidesRepo.findOne.mockResolvedValue({ id: 1 });
      guidesRepo.save.mockRejectedValue(new Error("save error"));

      await expect(service.update(1, {})).rejects.toThrow(HttpException);
    });
  });

  describe("remove", () => {
    it("should remove guide successfully", async () => {
      guidesRepo.delete.mockResolvedValue(true);
      const result = await service.remove(1);
      expect(result).toBe("Guía eliminada con éxito");
    });

    it("should throw on error", async () => {
      guidesRepo.delete.mockRejectedValue(new Error("delete error"));
      await expect(service.remove(1)).rejects.toThrow(HttpException);
    });
  });

  describe("total", () => {
    it("should return total number of guides", async () => {
      guidesRepo.total.mockResolvedValue(10);
      const result = await service.total();
      expect(result).toBe(10);
    });
  });
});
