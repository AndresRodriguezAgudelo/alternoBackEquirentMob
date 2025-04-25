import { Test, TestingModule } from "@nestjs/testing";
import { InsurerService } from "./insurer.service";
import { InsurerRepository } from "../repositories/insurer.repository";
import { HttpException, HttpStatus } from "@nestjs/common";
import { CreateInsurerDto, UpdateInsurerDto } from "../schemas/insurer.schema";
import { Insurer } from "../entities/insurer.entity";
import { PageDto, PageOptionsDto } from "@/common";

const mockInsurerRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe("InsurerService", () => {
  let service: InsurerService;
  let repository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InsurerService,
        {
          provide: InsurerRepository,
          useFactory: mockInsurerRepository,
        },
      ],
    }).compile();

    service = module.get<InsurerService>(InsurerService);
    repository = module.get<InsurerRepository>(InsurerRepository);
  });

  describe("create", () => {
    it("should throw if insurer already exists", async () => {
      repository.findOne.mockResolvedValue({ nameInsurer: "Sura" });

      const dto: CreateInsurerDto = { nameInsurer: "Sura" };
      await expect(service.create(dto)).rejects.toThrow(
        new HttpException("La aseguradora ya existe", HttpStatus.BAD_REQUEST),
      );
    });

    it("should create a new insurer", async () => {
      repository.findOne.mockResolvedValue(null);
      repository.save.mockResolvedValue({ id: 1, nameInsurer: "Bolívar" });

      const dto: CreateInsurerDto = { nameInsurer: "Bolívar" };
      const result = await service.create(dto);
      expect(result).toEqual({ id: 1, nameInsurer: "Bolívar" });
      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe("findAll", () => {
    it("should return a page of insurers", async () => {
      const pageOptions: any = new PageOptionsDto();
      const pageResult = new PageDto<Insurer>([], pageOptions);

      repository.findAll.mockResolvedValue(pageResult);

      const result = await service.findAll(pageOptions);
      expect(result).toEqual(pageResult);
      expect(repository.findAll).toHaveBeenCalledWith(pageOptions);
    });

    it("should throw on repository error", async () => {
      const pageOptions = new PageOptionsDto();
      repository.findAll.mockRejectedValue(new Error("DB Error"));

      await expect(service.findAll(pageOptions)).rejects.toThrow(HttpException);
    });
  });

  describe("findOne", () => {
    it("should return an insurer if found", async () => {
      repository.findOne.mockResolvedValue({ id: 1, nameInsurer: "Mapfre" });

      const result = await service.findOne(1);
      expect(result).toEqual({ id: 1, nameInsurer: "Mapfre" });
    });

    it("should throw if not found", async () => {
      repository.findOne.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(
        new HttpException("Aseguradora no encontrada", HttpStatus.NOT_FOUND),
      );
    });
  });

  describe("update", () => {
    it("should update insurer and return success message", async () => {
      repository.update.mockResolvedValue("Updated");
      const dto: UpdateInsurerDto = { nameInsurer: "Liberty" };
      const result = await service.update(1, dto);
      expect(result).toBe("Updated");
      expect(repository.update).toHaveBeenCalledWith(1, dto);
    });

    it("should throw on repository error", async () => {
      repository.update.mockRejectedValue(new Error("DB error"));
      await expect(service.update(1, { nameInsurer: "X" })).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe("remove", () => {
    it("should remove insurer", async () => {
      repository.remove.mockResolvedValue("Removed");
      const result = await service.remove(1);
      expect(result).toBe("Removed");
      expect(repository.remove).toHaveBeenCalledWith(1);
    });

    it("should throw on repository error", async () => {
      repository.remove.mockRejectedValue(new Error("DB error"));
      await expect(service.remove(1)).rejects.toThrow(HttpException);
    });
  });
});
