import { Test, TestingModule } from '@nestjs/testing';
import { FilesController } from './files.controller';
import { FilesService } from '../services/files.service';
import { Response } from 'express';

jest.mock('../services/files.service');

describe('FilesController', () => {
  let controller: FilesController;
  let service: jest.Mocked<FilesService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [
        {
          provide: FilesService,
          useValue: {
            getPublicFile: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<FilesController>(FilesController);
    service = module.get(FilesService);
  });

  describe('getPublicFile', () => {
    it('should return a public file', async () => {
      const mockResponse = {
        send: jest.fn(),
        status: jest.fn().mockReturnThis(),
        setHeader: jest.fn()
      } as unknown as Response;
  
      const folderName = 'uploads';
      const id = 'file-id';
  
      service.getPublicFile.mockImplementationOnce(async (folder, fileId, res) => {
        res.setHeader('Content-Type', 'application/octet-stream');
        res.send('File content');
      });
  
      await controller.getPublicFile(id, mockResponse, folderName);
  
      expect(service.getPublicFile).toHaveBeenCalledWith(folderName, id, mockResponse);
      expect(service.getPublicFile).toHaveBeenCalledTimes(1);
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'application/octet-stream');
      expect(mockResponse.send).toHaveBeenCalledWith('File content');
    });
  });
  
});
