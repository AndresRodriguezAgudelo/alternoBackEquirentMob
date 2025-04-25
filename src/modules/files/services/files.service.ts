import {
  BlobServiceClient,
  ContainerClient,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { throwCustomError } from "@/common/utils/Error";
import { Response } from "express";
import { Readable } from "stream";
import * as sharp from "sharp";
import getConfig from "../../../config/environment/local";
import { UploadFileDto } from "../schemas/files.schema";
import { IPrivateFile } from "@/interfaces/file.interface";
@Injectable()
export class FilesService {
  public readonly containerClient: ContainerClient;
  private readonly config: Record<string, string>;

  constructor() {
    this.config = this.loadConfig();
    this.containerClient = this.initializeBlobContainer();
  }

  private loadConfig(): Record<string, string> {
    return getConfig();
  }

  private initializeBlobContainer(): ContainerClient {
    const { ACCOUNT_AZURE, ACCOUNT_KEY, BUCKET_NAME } = this.config;
    const blobServiceClient = new BlobServiceClient(
      `https://${ACCOUNT_AZURE}.blob.core.windows.net`,
      new StorageSharedKeyCredential(ACCOUNT_AZURE, ACCOUNT_KEY),
    );

    return blobServiceClient.getContainerClient(BUCKET_NAME);
  }

  public async getPublicFile(
    folderName: string,
    id: string,
    res: Response,
  ): Promise<void> {
    try {
      const key = `${folderName}/${id}`;

      const fileData = await this.getPrivateFile(key);
      if (!fileData) {
        throwCustomError("file_not_found");
      }

      res.writeHead(200, {
        "Content-Type": fileData.contentType,
        "Content-Length": fileData.contentLength.toString(),
        "Accept-Ranges": "bytes",
        ETag: fileData.eTag,
      });

      const stream = new Readable();
      stream.push(fileData.fileBuffer);
      stream.push(null);

      stream.pipe(res).on("error", (err) => {
        throw new HttpException(
          "Error streaming the file",
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        "An unexpected error occurred while retrieving the file",
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  


  public async uploadFile(data: UploadFileDto): Promise<string> {
    try {

      let { category, file, name } = data;
      const { buffer, mimetype, size } = file;
      const [, ext] = mimetype.split("/");

      name = name.trim();

      let fileBuffer = Buffer.from(buffer);
      let fileExt = ext;
      let fileMimetype = mimetype;

      const allowedExtensions = ["jpg", "jpeg", "png", "webp", "mp4"];
      if (!allowedExtensions.includes(fileExt)) {
        throwCustomError("file_is_invalid");
      }

      console.log('peso de la imagen',file);
      
      const maxSizeInBytes = 10 * 1024 * 1024;
      console.log('maxSizeInBytes',maxSizeInBytes);

      if (size > maxSizeInBytes) {
        throwCustomError("file_size_exceeded");
      }

      if (mimetype.startsWith("image/")) {
        try {
          fileBuffer = await sharp(fileBuffer).webp().toBuffer();
          fileMimetype = "image/webp";
          fileExt = "webp";
        } catch (error) {
          console.error("Error processing image with Sharp:", error.message);
          throwCustomError("file_not_sharp");
        }
      }

      const blobName = `${category}/${name.trim()}-${Date.now()}.${fileExt}`;
      const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);

      try {
        await blockBlobClient.uploadData(fileBuffer, {
          blobHTTPHeaders: { blobContentType: fileMimetype },
        });
        return blobName;
      } catch (error) {
        console.error("Error uploading to Azure Storage:", error.message);
        throwCustomError("file_upload_failed");
      }
    } catch (error) {
      if (!(error instanceof HttpException)) {
        console.error("Unexpected error:", error);
        throw new HttpException(
          "Unexpected error while uploading file",
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw error;
    }
  }

  public async getPrivateFile(key: string): Promise<IPrivateFile> {
    try {
      const blobClient = this.containerClient.getBlockBlobClient(key);

      const exists = await blobClient.exists();
      if (!exists) {
        throw throwCustomError("file_not_found");
      }

      const downloadResponse = await blobClient.download();
      const fileBuffer = await this.streamToBuffer(
        downloadResponse.readableStreamBody!,
      );

      const response: IPrivateFile = {
        contentType: downloadResponse.contentType!,
        contentLength: downloadResponse.contentLength!,
        eTag: downloadResponse.etag!,
        fileBuffer,
      };

      return response;
    } catch (error) {
      if (!(error instanceof HttpException)) {
        console.error("Unexpected error:", error);
        throw new HttpException(
          "Unexpected error while getting file",
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw error;
    }
  }

  private async streamToBuffer(
    readableStream: NodeJS.ReadableStream,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      readableStream.on("data", (data) => chunks.push(data));
      readableStream.on("end", () => resolve(Buffer.concat(chunks)));
      readableStream.on("error", reject);
    });
  }
}
