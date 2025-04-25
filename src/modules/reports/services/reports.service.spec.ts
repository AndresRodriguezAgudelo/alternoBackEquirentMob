import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { UserService } from '@/modules/user/services/user.service';
import { QueryHistoryService } from '@/modules/query-history/services/query-history.service';
import { Response } from 'express';
import * as ExcelJS from 'exceljs';
import { PageOptionsDto } from '@/common';
import { PassThrough } from 'stream';

jest.mock('@/modules/user/services/user.service');
jest.mock('@/modules/query-history/services/query-history.service');

describe('ReportsService', () => {
  let service: ReportsService;
  let userService: UserService;
  let queryHistoryService: QueryHistoryService;
  let responseMock: Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReportsService, UserService, QueryHistoryService],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
    userService = module.get<UserService>(UserService);
    queryHistoryService = module.get<QueryHistoryService>(QueryHistoryService);

    const stream = new PassThrough();
    responseMock = Object.assign(stream, {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      end: jest.fn(),
    }) as unknown as Response;
  });

  describe('generateExcelReports', () => {
    it('should generate an Excel file', async () => {
      const endpointsData = {
        Usuarios: { data: [{ name: 'John' }], meta: {} },
      };

      await service.generateExcelReports(endpointsData, responseMock);

      expect(responseMock.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      expect(responseMock.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename=reporte.xlsx',
      );
    });
  });
  describe('getExcelReport', () => {
    it('should call queryHistoryService.findAll when module is querys', async () => {
      const queryData = { data: [
       { id: 1, name: 'Test User', phone: '1234567890', email: 'test@example.com', accepted: true, city: { id: 1, cityName: 'Test City', users: [], vehicles: [] }, cityId: 1, userVehicles: [], photo: null, createdAt: new Date(), updatedAt: new Date(), password: 'test', verify: true, status: true }
      ], meta: {
        hasPreviousPage: false,
        hasNextPage: false,
        page: 1,
        take: 10,
        total: 1,
        pageCount: 1
      } };
      jest.spyOn(queryHistoryService, 'findAll').mockResolvedValue(queryData);

      await service.getExcelReport('querys', { page: 1, take: 10, skip: 0 }, responseMock);

      expect(queryHistoryService.findAll).toHaveBeenCalledWith({ page: 1, take: 10, skip: 0 });
    });
  });
});
