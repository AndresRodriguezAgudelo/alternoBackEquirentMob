import { Test, TestingModule } from "@nestjs/testing";
import { CityService } from "./city.service";
import { CityRepository } from "../repositories/city.repository";
import { HttpException, HttpStatus } from "@nestjs/common";
import { CreateCityDto, UpdateCityDto } from "../schemas/city.schema";
import { City } from "../entities/city.entity";
import { PageDto, PageOptionsDto } from "@/common";

const mockCityRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe("CityService", () => {
  let service: CityService;
  let repository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CityService,
        { provide: CityRepository, useFactory: mockCityRepository },
      ],
    }).compile();

    service = module.get<CityService>(CityService);
    repository = module.get<CityRepository>(CityRepository);
  });

  describe("create", () => {
    it("should create a city", async () => {
      const dto: CreateCityDto = { cityName: "Bogotá" };
      repository.findOne.mockResolvedValue(null);
      repository.save.mockResolvedValue({ id: 1, ...dto });

      const result = await service.create(dto);
      expect(result).toEqual({ id: 1, ...dto });
      expect(repository.save).toHaveBeenCalled();
    });

    it("should throw if city already exists", async () => {
      repository.findOne.mockResolvedValue({ cityName: "Bogotá" });
      await expect(service.create({ cityName: "Bogotá" })).rejects.toThrow(
        new HttpException("La ciudad ya existe", HttpStatus.BAD_REQUEST),
      );
    });
  });

  describe("findAll", () => {
    it("should return paginated cities", async () => {
      const pageOptions: any = new PageOptionsDto();
      const result = new PageDto<City>([], pageOptions);
      repository.findAll.mockResolvedValue(result);

      expect(await service.findAll(pageOptions)).toEqual(result);
    });
  });

  describe("findOne", () => {
    it("should return a city if exists", async () => {
      repository.findOne.mockResolvedValue({ id: 1, cityName: "Cali" });
      const result = await service.findOne(1);
      expect(result).toEqual({ id: 1, cityName: "Cali" });
    });

    it("should throw if city not found", async () => {
      repository.findOne.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(
        new HttpException("Ciudad no encontrada", HttpStatus.NOT_FOUND),
      );
    });
  });

  describe("update", () => {
    it("should update city and return success message", async () => {
      repository.update.mockResolvedValue("Actualizado");
      const dto: UpdateCityDto = { cityName: "Cartagena" };
      const result = await service.update(1, dto);
      expect(result).toBe("Actualizado");
    });
  });

  describe("remove", () => {
    it("should remove city", async () => {
      repository.remove.mockResolvedValue("Eliminado");
      const result = await service.remove(1);
      expect(result).toBe("Eliminado");
    });
  });
});
