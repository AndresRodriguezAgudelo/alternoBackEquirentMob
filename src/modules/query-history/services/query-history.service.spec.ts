import { Test, TestingModule } from "@nestjs/testing";
import { QueryHistoryService } from "./query-history.service";
import { QueryHistoryRepository } from "../repositories/query-history.repository";
import { PageDto } from "@/common";
import { HttpException, HttpStatus } from "@nestjs/common";
import { FiltersQueryHistoryDto } from "../schemas/query-history.schema";
import { QueryHistory } from "../entities/query-history.entity";

describe("QueryHistoryService", () => {
  let service: QueryHistoryService;
  let repository: jest.Mocked<QueryHistoryRepository>;

  // 1) Creamos el objeto mock con Partial<jest.Mocked<QueryHistoryRepository>>
  const mockQueryHistoryRepository: Partial<
    jest.Mocked<QueryHistoryRepository>
  > = {
    logQuery: jest.fn(),
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueryHistoryService,
        {
          provide: QueryHistoryRepository,
          useValue: mockQueryHistoryRepository,
        },
      ],
    }).compile();

    service = module.get<QueryHistoryService>(QueryHistoryService);

    // 2) Forzamos cast para tener un typed jest.Mocked de los métodos
    repository = module.get(
      QueryHistoryRepository,
    ) as jest.Mocked<QueryHistoryRepository>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("logQuery", () => {
    it("should call repository.logQuery", async () => {
      // configuramos el mock
      repository.logQuery.mockResolvedValueOnce();

      // Llamada al servicio
      await service.logQuery(10, "RTM");

      // Verificación
      expect(repository.logQuery).toHaveBeenCalledWith(10, "RTM");
    });
  });

  describe("findAll", () => {
    it("should return page data on success", async () => {
      const pageOptions: any = {
        page: 1,
        limit: 10,
        skip: 0,
        module: "SOAT",
        order: "ASC",
      };
      const pageResult = new PageDto<QueryHistory>([], pageOptions);

      repository.findAll.mockResolvedValueOnce(pageResult);

      const result = await service.findAll(pageOptions);
      expect(result).toBe(pageResult);
      expect(repository.findAll).toHaveBeenCalledWith(pageOptions);
    });

    it("should throw HttpException if repository fails", async () => {
      const pageOptions: any = {
        page: 1,
        limit: 10,
        skip: 0,
        module: "SOAT",
        order: "ASC",
      };
      repository.findAll.mockRejectedValueOnce(new Error("DB error"));

      await expect(service.findAll(pageOptions)).rejects.toThrow(HttpException);
      try {
        await service.findAll(pageOptions);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect((error as HttpException).getStatus()).toBe(
          HttpStatus.BAD_REQUEST,
        );
      }
    });
  });

  describe("getModules", () => {
    // Notar que este método es asíncrono en el servicio,
    // así que debemos hacer 'async' o usar '.then(...)'
    it("should return modules array", async () => {
      const result = await service.getModules(); // <--- await
      expect(result).toEqual([
        "Registro inicial",
        "RTM",
        "SOAT",
        "LICENCIA DE CONDUCCIÓN",
        "Historial vehicular",
      ]);
    });
  });
});
