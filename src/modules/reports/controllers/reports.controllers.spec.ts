import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller';
import { ReportsService } from '../services/reports.service';
import { Response } from 'express';
import { PageOptionsDto } from '@/common';

jest.mock('../services/reports.service');

describe('ReportsController', () => {
  let controller: ReportsController;
  let reportsService: ReportsService;
  let responseMock: Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [ReportsService],
    }).compile();

    controller = module.get<ReportsController>(ReportsController);
    reportsService = module.get<ReportsService>(ReportsService);
    responseMock = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as unknown as Response;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getExcelReport', () => {
    it('should call reportsService.getExcelReport with correct parameters', async () => {
      const module = 'users';
      const pageOptionsDto: PageOptionsDto = { page: 1, take: 10, skip:0 };
      const responseData = Buffer.from('some data');
  
      jest.spyOn(reportsService, 'getExcelReport').mockImplementation(async (module, pageOptionsDto, res) => {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(responseData);
        return responseData;
      });
  
      await controller.getExcelReport(module, pageOptionsDto, responseMock);
  
      expect(reportsService.getExcelReport).toHaveBeenCalledWith(module, pageOptionsDto, responseMock);
      expect(responseMock.setHeader).toHaveBeenCalledWith('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      expect(responseMock.send).toHaveBeenCalledWith(responseData);
    });
  });
  
});
