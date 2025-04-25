import { Test, TestingModule } from '@nestjs/testing';
import { ListService } from './list.service';
import { Repository, DataSource } from 'typeorm';
import { ListOrder } from '../entities/list.entity';
import { BadRequestException } from '@nestjs/common';
import { UpdateListOrderDto } from '../schemas/list.schemas';
import { getRepositoryToken } from '@nestjs/typeorm';


describe('ListService', () => {
  let service: ListService;
  let listOrderRepository: jest.Mocked<Repository<ListOrder>>;
  let dataSource: jest.Mocked<DataSource>;

  const mockRepository = () => ({
    find: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  });

  const mockDataSource = () => ({
    getRepository: jest.fn().mockReturnValue({
      createQueryBuilder: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
      }),
    }),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListService,
        { provide: getRepositoryToken(ListOrder), useValue: mockRepository() },
        { provide: DataSource, useValue: mockDataSource() },
      ],
    }).compile();

    service = module.get<ListService>(ListService);
    listOrderRepository = module.get(getRepositoryToken(ListOrder));
    dataSource = module.get(DataSource);
  });

  describe('upsertListOrder', () => {
    it('should update an existing order', async () => {
      const dto: UpdateListOrderDto = { orderIds: [1, 2, 3] };
      listOrderRepository.find.mockResolvedValue([{ orderIds: [1, 2], id: 1 }]);
      listOrderRepository.save.mockResolvedValue(undefined);

      await service.upsertListOrder(dto);

      expect(listOrderRepository.save).toHaveBeenCalled();
    });

    it('should create a new order if none exists', async () => {
      const dto: UpdateListOrderDto = { orderIds: [1, 2, 3] };
      listOrderRepository.find.mockResolvedValue([]);
      listOrderRepository.create.mockReturnValue(dto as any);
      listOrderRepository.save.mockResolvedValue(undefined);

      await service.upsertListOrder(dto);

      expect(listOrderRepository.save).toHaveBeenCalled();
    });

    it('should throw a BadRequestException if orderIds do not exist', async () => {
      const dto: UpdateListOrderDto = { orderIds: [4, 5, 6] };
      jest.spyOn<any, any>(service, 'getNonExistentIds').mockResolvedValue([4, 5]);

      await expect(service.upsertListOrder(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getOrderIds', () => {
    it('should return all orders', async () => {
      const orders = [{ orderIds: [1, 2], id: 1 }];
      listOrderRepository.find.mockResolvedValue(orders as any);

      const result = await service.getOrderIds();

      expect(result).toEqual(orders);
      expect(listOrderRepository.find).toHaveBeenCalled();
    });
  });

  describe('getNonExistentIds', () => {
    it('should return non-existent IDs', async () => {
      const orderIds = [1, 2, 3];
      const existingIds = [{ id: 1 }, { id: 2 }];
      
      // Crear un mock para createQueryBuilder y getMany
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(existingIds), // Ahora getMany es un mock con mockResolvedValue
      };

      // Mock de getRepository para devolver nuestro mockQueryBuilder
      dataSource.getRepository = jest.fn().mockReturnValue({
        createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder)
      });

      const result = await service['getNonExistentIds'](orderIds);

      expect(result).toEqual([3]); // Solo el ID 3 es inexistente
    });
  });


});
