jest.setTimeout(10000);

// 1. Mockeamos getConfig()
jest.mock("../../../config/environment/local", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    ACCOUNT_AZURE: "mock-azure",
    ACCOUNT_KEY: "mock-key",
    BUCKET_NAME: "mock-container",
  })),
}));

import getConfig from "../../../config/environment/local";
import { FilesService } from "./files.service";
import { HttpException } from "@nestjs/common";
import { Response } from "express";
import * as sharp from "sharp";
import { Readable, Writable } from "stream";

// 2. Mockeamos 'sharp'
jest.mock("sharp");

// 3. Importamos las clases reales de @azure/storage-blob
import {
  BlobServiceClient,
  ContainerClient,
  BlockBlobClient,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";

// 4. Mock directo de @azure/storage-blob (constructor, etc.)
jest.mock("@azure/storage-blob", () => {
  // Retornamos un objeto con las clases exportadas
  return {
    __esModule: true,
    StorageSharedKeyCredential: jest.fn(),
    ContainerClient: jest.fn(),
    BlockBlobClient: jest.fn(),
    // El constructor de BlobServiceClient
    BlobServiceClient: jest.fn(),
  };
});

// Variables globales para reasignar en cada test
let mockUpload: jest.Mock;
let mockDownload: jest.Mock;
let mockExists: jest.Mock;

describe("FilesService", () => {
  let service: FilesService;

  beforeEach(() => {
    // Reasignamos mocks en cada test
    mockUpload = jest.fn();
    mockDownload = jest.fn();
    mockExists = jest.fn();

    (getConfig as jest.Mock).mockReturnValue({
      ACCOUNT_AZURE: "mock-azure",
      ACCOUNT_KEY: "mock-key",
      BUCKET_NAME: "mock-container",
    });

    // Aquí configuramos la implementación de new BlobServiceClient()
    (BlobServiceClient as unknown as jest.Mock).mockImplementation(
      (url: string, credential: StorageSharedKeyCredential) => {
        return {
          getContainerClient: jest
            .fn()
            .mockImplementation((containerName: string) => {
              return {
                getBlockBlobClient: jest
                  .fn()
                  .mockImplementation((blobName: string) => {
                    return {
                      uploadData: mockUpload,
                      exists: mockExists,
                      download: mockDownload,
                    };
                  }),
              };
            }),
        };
      },
    );

    service = new FilesService();
  });

  describe("uploadFile", () => {
    it("should upload image file and return blob name", async () => {
      (sharp as any).mockReturnValue({
        webp: () => ({
          toBuffer: () => Buffer.from("image"),
        }),
      });

      const data = {
        category: "test",
        name: "image",
        file: {
          buffer: Buffer.from("dummy"),
          mimetype: "image/jpeg",
          size: 1024,
        },
      };

      mockUpload.mockResolvedValue(true);

      const result = await service.uploadFile(data);
      expect(result).toMatch(/test\/image-.*\.webp/);
    });

    it("should throw on unsupported file type", async () => {
      const data = {
        category: "test",
        name: "file",
        file: {
          buffer: Buffer.from("dummy"),
          mimetype: "application/pdf",
          size: 1024,
        },
      };

      await expect(service.uploadFile(data)).rejects.toThrow(HttpException);
    });

    it("should throw on file size exceeded", async () => {
      const data = {
        category: "test",
        name: "file",
        file: {
          buffer: Buffer.from("dummy"),
          mimetype: "image/jpeg",
          size: 11 * 1024 * 1024,
        },
      };

      await expect(service.uploadFile(data)).rejects.toThrow(HttpException);
    });
  });

  describe("getPrivateFile", () => {
    it("should return private file info", async () => {
      const mockStream = new Readable();
      mockStream.push("file-content");
      mockStream.push(null);

      mockExists.mockResolvedValue(true);
      mockDownload.mockResolvedValue({
        readableStreamBody: mockStream,
        contentType: "image/jpeg",
        contentLength: 123,
        etag: "etag",
      });

      const key = "folder/file.jpg";
      const result = await service.getPrivateFile(key);
      expect(result.contentType).toBe("image/jpeg");
      expect(result.eTag).toBe("etag");
    });

    it("should throw if file does not exist", async () => {
      mockExists.mockResolvedValue(false);
      await expect(service.getPrivateFile("not-found")).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe("getPublicFile", () => {
    it("should stream file to response", async () => {
      const fileBuffer = Buffer.from("file-content");

      // 1. Crea un Response simulado como un Writable
      const res = new Writable({
        write(chunk, encoding, callback) {
          // Podrías guardar el chunk en algún lado o ignorarlo.
          callback();
        },
      }) as unknown as Response;

      // 2. Añade los métodos que tu servicio usa
      res.writeHead = jest.fn();
      res.on = jest.fn((event, handler) => {
        // Para que no lance error si tu servicio hace .on('error')
        if (event === "error") {
          // Podrías forzar un error
          // handler(new Error('fake error'));
        }
      }) as any;
      // y si tu servicio hace res.pipe(...) (no muy usual con Express, pero por si acaso)
      (res as any).pipe = jest.fn().mockReturnThis();

      // 3. Mockeas getPrivateFile
      jest.spyOn(service, "getPrivateFile").mockResolvedValue({
        contentType: "image/jpeg",
        contentLength: fileBuffer.length,
        eTag: "etag-value",
        fileBuffer,
      });

      await service.getPublicFile("folder", "file.jpg", res);

      expect(res.writeHead).toHaveBeenCalledWith(
        200,
        expect.objectContaining({
          "Content-Type": "image/jpeg",
          "Content-Length": fileBuffer.length.toString(),
        }),
      );
    });
  });
});
