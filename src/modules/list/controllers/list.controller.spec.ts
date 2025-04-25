import { Test, TestingModule } from '@nestjs/testing';
import { ListController } from './list.controller';
import { ListService } from '../services/list.service';
import { UpdateListOrderDto } from '../schemas/list.schemas';
import { ZodValidationPipe } from 'nestjs-zod';
import { BadRequestException } from '@nestjs/common';


describe('ListController', () => {
  let controller: ListController;
  let listService: ListService;

  const mockListService = {
    upsertListOrder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ListController],
      providers: [
        {
          provide: ListService,
          useValue: mockListService,
        },
      ],
    }).compile();

    controller = module.get<ListController>(ListController);
    listService = module.get<ListService>(ListService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('update', () => {
    it('should update the list order successfully', async () => {
      const updateListOrderDto: UpdateListOrderDto = {
        orderIds: [123, 456, 789],
      };

      mockListService.upsertListOrder.mockResolvedValueOnce(updateListOrderDto);

      const result = await controller['update'](updateListOrderDto);

      expect(result).toEqual(updateListOrderDto);
      expect(mockListService.upsertListOrder).toHaveBeenCalledWith(updateListOrderDto);
    });

    it('should throw an error if the input is invalid', async () => {
      const updateListOrderDto: any = {
        invalidField: 'invalid',
      };

      mockListService.upsertListOrder.mockRejectedValueOnce(new BadRequestException());

      await expect(controller['update'](updateListOrderDto)).rejects.toThrow(BadRequestException);
      expect(mockListService.upsertListOrder).toHaveBeenCalledWith(updateListOrderDto);
    });
  });
});
